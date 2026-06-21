import { 
  ModuleProvider, 
  Modules
} from "@medusajs/framework/utils"
import BehpardakhtPaymentProvider from "./service"

export default ModuleProvider(Modules.PAYMENT, {
  services: [BehpardakhtPaymentProvider],
})