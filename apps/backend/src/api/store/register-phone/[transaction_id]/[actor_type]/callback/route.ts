import { MedusaRequest, MedusaResponse } from "@medusajs/framework/http";
import {
  AuthenticationInput,
  ConfigModule,
  IAuthModuleService,
} from "@medusajs/framework/types";
import {
  ContainerRegistrationKeys,
  MedusaError,
  Modules,
  TransactionHandlerType,
} from "@medusajs/framework/utils";
import { StepResponse } from "@medusajs/framework/workflows-sdk";
import { generateJwtTokenForAuthIdentity } from "@medusajs/medusa/api/auth/utils/generate-jwt-token";

export const GET = async (req: MedusaRequest, res: MedusaResponse) => {
  console.log(req.params)
  const { actor_type, transaction_id } = req.params;
  const auth_provider = "phone-auth";

  const config: ConfigModule = req.scope.resolve(
    ContainerRegistrationKeys.CONFIG_MODULE,
  );
  const service: IAuthModuleService = req.scope.resolve(Modules.AUTH);
  if (!transaction_id) return;

  const workflowEngineService = req.scope.resolve(Modules.WORKFLOW_ENGINE);

  try {
    const result = await workflowEngineService.setStepSuccess({
      idempotencyKey: {
        action: TransactionHandlerType.INVOKE,
        transactionId: transaction_id,
        stepId: "wait-for-otp-verification-step",
        workflowId: "register-with-phone",
      },
      stepResponse: new StepResponse({ verified: true }),
    });
    console.log("result", result);
  } catch (error) {
    console.error("Failed to resume workflow:", error);
  }

  const authData = {
    url: req.url,
    headers: req.headers,
    query: req.query,
    body: req.body,
    protocol: req.protocol,
  } as AuthenticationInput;

  const { success, error, authIdentity } = await service.validateCallback(
    auth_provider,
    authData,
  );

  if (success && authIdentity) {
    const { http } = config.projectConfig;

    const token = await generateJwtTokenForAuthIdentity(
      {
        authIdentity,
        actorType: actor_type,
        authProvider: auth_provider,
        container: req.scope,
      },
      {
        secret: http.jwtSecret!,
        expiresIn: http.jwtExpiresIn,
        options: http.jwtOptions,
      },
    );

    return res.json({ token });
  }

  throw new MedusaError(
    MedusaError.Types.UNAUTHORIZED,
    error || "Authentication failed",
  );
};

export const POST = async (req: MedusaRequest, res: MedusaResponse) => {
  await GET(req, res);
};
