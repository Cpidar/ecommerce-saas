import {
  AbstractAuthModuleProvider,
  AbstractEventBusModuleService,
  MedusaError,
} from "@medusajs/framework/utils";
import {
  AuthenticationInput,
  AuthIdentityProviderService,
  AuthenticationResponse,
  Logger,
  ICustomerModuleService,
} from "@medusajs/framework/types";
import jwt from "jsonwebtoken";

const OTP_RESEND_COOLDOWN_MS = 60_000;
const OTP_GENERATED_EVENT = "phone-auth.otp.generated";
const OTP_VERIFIED_EVENT = "phone-auth.otp.verified";

const failure = (error: string) =>
  ({ success: false, error }) satisfies AuthenticationResponse;

const MISSING_FIELDS = failure("Phone number, email and OTP are required");
const USER_NOT_FOUND = failure("User with phone number does not exist");
const NO_PHONE_PROVIDER = failure(
  "User with phone number does not have a phone auth provider",
);

const RATE_LIMITED = {
  success: false,
  error: "Please wait 60 seconds before requesting a new OTP",
} satisfies AuthenticationResponse;

type InjectedDependencies = {
  logger: Logger;
  event_bus: AbstractEventBusModuleService;
  customer: ICustomerModuleService;
};

type Options = {
  jwtSecret: string;
};

class PhoneAuthService extends AbstractAuthModuleProvider {
  static DISPLAY_NAME = "Phone Auth";
  static identifier = "phone-auth";
  private options: Options;
  private logger: Logger;
  private event_bus: AbstractEventBusModuleService;
  // private customer_service: ICustomerModuleService

  constructor(container: InjectedDependencies, options: Options) {
    // @ts-ignore
    super(...arguments);

    this.options = options;
    this.logger = container.logger;
    this.event_bus = container.event_bus;
    // this.customer_service = container.customer
  }

  static validateOptions(options: Record<any, any>): void | never {
    if (!options.jwtSecret) {
      throw new MedusaError(
        MedusaError.Types.INVALID_DATA,
        "JWT secret is required",
      );
    }
  }

  async register(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService,
  ): Promise<AuthenticationResponse> {
    const { phone, email, first_name, last_name, customer_id } =
      data.body || {};

    if (!phone) {
      return {
        success: false,
        error: "Phone number is required",
      };
    }

    try {
      await authIdentityProviderService.retrieve({
        entity_id: email,
      });

      return {
        success: false,
        error: "User with phone number already exists",
      };
    } catch (error) {
      const authIdentity = await authIdentityProviderService.create({
        entity_id: email,
        provider_metadata: {
          identifier: this.identifier,
        },
      });
      console.log("From phone-auth: ", authIdentity);

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
      // await createAuthMetaDataWorkflow().run({
      //   input: {
      //     authIdentityId: authIdentity.id,
      //     actorType: "customer",
      //     value: customer_id
      //   }
      // })

      return {
        success: true,
        authIdentity,
      };
    }
  }

  async authenticate(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService,
  ): Promise<AuthenticationResponse> {
    const { phone, email, avoid_otp, store_id } = data.body ?? {};
    console.log("🦒🦒🦒🦒data.body🦒🦒🦒🦒", data.body);
    if (!phone || !email) return MISSING_FIELDS;

    try {
      const { provider_identities, app_metadata } =
        await authIdentityProviderService.retrieve({
          entity_id: email,
        });

      const userProvider = provider_identities?.find(
        ({ provider }) => provider === this.identifier,
      );
      const metadata = userProvider?.provider_metadata;

      if (!userProvider || metadata?.transactionId) return USER_NOT_FOUND;

      if (this.isOtpRateLimited(metadata?.last_otp_sent_at))
        return RATE_LIMITED;

      if (!avoid_otp) {
        await this.issueOtp(
          authIdentityProviderService,
          email,
          phone,
          metadata,
        );

        return { success: true, location: "otp" };
      }

      console.log("🦒🦒🦒🦒app_metadata🦒🦒🦒🦒", provider_identities);
      console.log("🦒🦒🦒🦒app_metadata🦒🦒🦒🦒", app_metadata);
      if (!app_metadata?.customer_id) {
        // TODO: must remove authIdentity with entity_id first and then register
        return { success: false, location: "register" };
      }

      // if (store_id && store_id === process.env.SAAS_STORE_ID)
      //   return { success: true, location: "onboarding" };

      return { success: true, location: "password" };
    } catch (e) {
      console.error("🦒🦒🦒🦒e🦒🦒🦒🦒", e);
      if (!avoid_otp)
        await this.issueOtp(authIdentityProviderService, email, phone);
      return { location: "register", success: false };
    }
  }

  async validateCallback(
    data: AuthenticationInput,
    authIdentityProviderService: AuthIdentityProviderService,
  ): Promise<AuthenticationResponse> {
    const { phone, otp, email, transactionId } = data.query ?? {};

    if (!phone || !otp || !email) return MISSING_FIELDS;

    const user = await authIdentityProviderService.retrieve({
      entity_id: email,
    });
    if (!user) return USER_NOT_FOUND;

    const metadata = user.provider_identities?.find(
      ({ provider }) => provider === this.identifier,
    )?.provider_metadata;
    console.log("🦒🦒🦒🦒metadata🦒🦒🦒🦒", metadata);
    const hashedOtp = metadata?.otp;
    if (typeof hashedOtp !== "string" || !hashedOtp) return NO_PHONE_PROVIDER;

    const otpError = this.verifyOtp(hashedOtp, otp);
    if (otpError) return failure(otpError);

    // Consume the OTP so it can't be replayed
    const authIdentity = await authIdentityProviderService.update(email, {
      provider_metadata: { otp: null },
    });

    // Resume any workflow waiting on this verification
    console.log("🦒🦒🦒🦒transactionId🦒🦒🦒🦒", transactionId);
    if (transactionId) {
      console.log({ transactionId, email, phone });
      await this.event_bus.emit(
        { name: OTP_VERIFIED_EVENT, data: { transactionId, email, phone } },
        {},
      );
      await new Promise((resolve) => setTimeout(resolve, 2000))

      return { success: true, authIdentity }

      // Clear transactionId so it can't be reused
      // await authIdentityProviderService.update(email, {
      //   provider_metadata: { transactionId: null },
      // });
    }

    return { success: true, authIdentity };
  }

  /** Returns an error message, or `null` if the OTP is valid. */
  private verifyOtp(token: string, otp: string): string | null {
    try {
      const payload = jwt.verify(token, this.options.jwtSecret) as {
        otp?: string;
      };
      return payload.otp === otp ? null : "Invalid OTP";
    } catch (error) {
      return error instanceof Error && error.message
        ? error.message
        : "Invalid OTP";
    }
  }

  private isOtpRateLimited(lastSentAt: unknown, now = Date.now()): boolean {
    if (typeof lastSentAt !== "string") return false;

    const sentAt = Date.parse(lastSentAt);
    return Number.isFinite(sentAt) && now - sentAt < OTP_RESEND_COOLDOWN_MS;
  }

  private async issueOtp(
    service: AuthIdentityProviderService,
    email: string,
    phone: string,
    existingMetadata?: Record<string, unknown>,
  ): Promise<void> {
    const { hashedOTP, otp } = await this.generateOTP(phone);

    await service.update(email, {
      provider_metadata: {
        ...existingMetadata,
        otp: hashedOTP,
        last_otp_sent_at: new Date().toISOString(),
      },
    });

    await this.event_bus.emit(
      { name: OTP_GENERATED_EVENT, data: { otp, phone } },
      {},
    );
  }
  private async generateOTP(
    phone: string,
  ): Promise<{ hashedOTP: string; otp: string }> {
    let otp: string;
    const otpExpirationTime = "300s";

    if (process.env.OTP_PROVIDER === "melipayamak") {
      // MelliPayamak OTP
      otp = await fetch(
        "https://console.melipayamak.com/api/send/otp/d2a06968057f4cdf80c0a719d815e24b",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // 'Content-Length': phone.length
          },
          body: JSON.stringify({ to: phone }),
        },
      )
        .then((res) => res.json())
        .then((res) => res.code)
        .catch(console.log);
    } else {
      // Generate a 6-digit OTP
      otp = Math.floor(100000 + Math.random() * 900000).toString();
    }
    // for debug
    this.logger.info(`Generated OTP: ${otp}`);

    const hashedOTP = jwt.sign({ otp }, this.options.jwtSecret, {
      expiresIn: otpExpirationTime,
    });
    return { hashedOTP, otp };
  }
}

export default PhoneAuthService;
