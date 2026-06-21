import { createCustomerAccountWorkflow } from "@medusajs/medusa/core-flows"
import {
  AbstractAuthModuleProvider,
  AbstractEventBusModuleService,
  MedusaError,
  Modules
} from "@medusajs/framework/utils"
import { createWorkflow } from "@medusajs/framework/workflows-sdk"
import {
  AuthenticationInput,
  AuthIdentityProviderService,
  AuthenticationResponse,
  Logger,
  ICustomerModuleService,
} from "@medusajs/framework/types"
import jwt from "jsonwebtoken"
import { createAuthMetaDataWorkflow } from "../../workflows/register-phone"
import { email } from "@medusajs/framework/zod"

type InjectedDependencies = {
  logger: Logger
  event_bus: AbstractEventBusModuleService,
  customer: ICustomerModuleService,

}

type Options = {
  jwtSecret: string
}

class PhoneAuthService extends AbstractAuthModuleProvider {
  static DISPLAY_NAME = "Phone Auth"
  static identifier = "phone-auth"
  private options: Options
  private logger: Logger
  private event_bus: AbstractEventBusModuleService
  // private customer_service: ICustomerModuleService

  constructor(container: InjectedDependencies, options: Options) {
    // @ts-ignore
    super(...arguments)

    this.options = options
    this.logger = container.logger
    this.event_bus = container.event_bus
    // this.customer_service = container.customer

  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.jwtSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "JWT secret is required"
      )
    }
  }

  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { phone, email, first_name, last_name, customer_id } = data.body || {}

    if (!phone) {
      return {
        success: false,
        error: "Phone number is required"
      }
    }

    try {
      await authIdentityProviderService.retrieve({
        entity_id: email,
      })

      return {
        success: false,
        error: "User with phone number already exists"
      }
    } catch (error) {

      const authIdentity = await authIdentityProviderService.create({
        entity_id: email,
        provider_metadata: {
          identifier: this.identifier
        }
      })


      // If no existing customer: create new customer + link auth identity
      // for using multi provider (emailpass and phone-auth) first register with emailpass and the create customer and link with it. then regist phone-auth. so no need to create custmer
      // const customer = await this.customer_service.retrieveCustomer(email)

      // this is add {customer_id: cus_xxxx} into app_metadata of auth entity that links auth module with customer
      // here we ensure the identity points to the same customer
      // const { result } = await createCustomerAccountWorkflow()
      //   .run({
      //     input: {
      //       authIdentityId: authIdentity.id,
      //       customerData: {
      //         first_name,
      //         last_name,
      //         email,
      //         phone
      //       }
      //     }
      //   })

      // this is add {customer_id: cus_xxxx} into app_metadata of auth entity that links auth module with customer
      // here we ensure the identity points to the same customer
      await createAuthMetaDataWorkflow().run({
        input: {
          authIdentityId: authIdentity.id,
          actorType: "customer",
          value: customer_id
        }
      })

      return {
        success: true,
        authIdentity
      }
    }
  }



  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { phone, email } = data.body || {}

    if (!phone || !email) {
      return {
        success: false,
        error: "Phone number is required"
      }
    }

    try {
      await authIdentityProviderService.retrieve({
        entity_id: email,
      }).then(console.log)
    } catch (error) {
      return {
        success: false,
        error: "User with phone number does not exist",
        location: "register"
      }
    }

    const { hashedOTP, otp } = await this.generateOTP(phone)

    await authIdentityProviderService.update(email, {
      provider_metadata: {
        otp: hashedOTP,
      }
    })

    await this.event_bus.emit({
      name: "phone-auth.otp.generated",
      data: {
        otp,
        phone,
      }
    }, {})

    return {
      success: true,
      location: "otp"
    }
  }

  async generateOTP(phone: string): Promise<{ hashedOTP: string, otp: string }> {
    // Generate a 6-digit OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString()

    // MelliPayamak OTP
    // const otp = await fetch("https://console.melipayamak.com/api/send/otp/d2a06968057f4cdf80c0a719d815e24b", {
    //   method: "POST",
    //   headers: {
    //     'Content-Type': 'application/json',
    //     // 'Content-Length': phone.length
    //   },
    //   body: JSON.stringify({ to: phone })
    // }).then(res => res.json()).then(res => res.code).catch(console.log)


    // for debug
    // this.logger.info(`Generated OTP: ${otp}`)

    const hashedOTP = jwt.sign({ otp }, this.options.jwtSecret, {
      expiresIn: "300s"
    })

    return { hashedOTP, otp }
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService
  ): Promise<AuthenticationResponse> {
    const { phone, otp, email } = data.query || {}

    if (!phone || !otp) {
      return {
        success: false,
        error: "Phone number and OTP are required"
      }
    }

    const user = await authIdentityProviderService.retrieve({
      entity_id: email,
    })

    if (!user) {
      return {
        success: false,
        error: "User with phone number does not exist"
      }
    }

    // verify that OTP is correct
    const userProvider = user.provider_identities?.find((provider) => provider.provider === this.identifier)

    if (!userProvider || !userProvider.provider_metadata?.otp) {
      return {
        success: false,
        error: "User with phone number does not have a phone auth provider"
      }
    }

    try {
      const decodedOTP = jwt.verify(
        userProvider.provider_metadata.otp as string,
        this.options.jwtSecret
      ) as { otp: string }

      if (decodedOTP.otp !== otp) {
        throw new Error("Invalid OTP")
      }
    } catch (error) {
      return {
        success: false,
        error: (error as any).message || "Invalid OTP"
      }
    }

    const updatedUser = await authIdentityProviderService.update(email, {
      provider_metadata: {
        otp: null,
      }
    })

    return {
      success: true,
      authIdentity: updatedUser
    }
  }
}

export default PhoneAuthService