import { createStep, StepResponse } from "@medusajs/framework/workflows-sdk";
import { Modules } from "@medusajs/framework/utils";
import {
  IUserModuleService,
  IAuthModuleService,
  AuthenticationInput,
  AuthenticationResponse,
} from "@medusajs/framework/types";

type CreateUserInput = {
  email: string;
  password: string;
  metadata?: Record<string, any>;
};

export type CreateUserStepCompensationInput = {
  userId?: string;
  authIdentityId?: string;
};

export const createUserStep = createStep(
  "create-user-step",
  async (input: CreateUserInput, { container }) => {
    const userService: IUserModuleService = container.resolve(Modules.USER);
    const authService: IAuthModuleService = container.resolve(Modules.AUTH);
    const compensationInput: CreateUserStepCompensationInput = {};

    try {
      const metadata = input.metadata || {};
      // 1. create user
      const user = await userService.createUsers({
        ...input,
        metadata,
      });
      compensationInput.userId = user.id;

      // [MY-FORK] handle both authentication and registeration scenario
      // 2. create/retrieve auth identity
      let authResponse: AuthenticationResponse
      try {
        authResponse = await authService.authenticate("emailpass", {
          body: {
            email: input.email,
            password: input.password,
          },
        } as AuthenticationInput)
        compensationInput.authIdentityId = authResponse.authIdentity.id

      } catch {
        authResponse = await authService.register("emailpass", {
          body: {
            email: input.email,
            password: input.password,
          },
        } as AuthenticationInput);
        compensationInput.authIdentityId = authResponse.authIdentity.id;
      }

      // 3. attach auth identity to user
      await authService.updateAuthIdentities({
        id: authResponse.authIdentity.id,
        app_metadata: {
          ...authResponse.authIdentity.app_metadata,
          user_id: user.id,
        },
      });

      // 4. do we want to authenticate immediately?
      //
      // const authenticationResponse = await authService.authenticate("emailpass", {
      //   body: {
      //     email: input.email,
      //     password: input.password,
      //   },
      // } as AuthenticationInput);

      return new StepResponse({ user, authResponse }, compensationInput);
    } catch (error) {
      return StepResponse.permanentFailure(error, compensationInput);
    }
  },
  async (input: CreateUserStepCompensationInput, { container }) => {
    const userService: IUserModuleService = container.resolve(Modules.USER);
    const authService: IAuthModuleService = container.resolve(Modules.AUTH);

    if (input?.userId) {
      await userService.deleteUsers([input.userId]);
    }
    if (input?.authIdentityId) {
      await authService.deleteAuthIdentities([input.authIdentityId]);
    }
  },
);
