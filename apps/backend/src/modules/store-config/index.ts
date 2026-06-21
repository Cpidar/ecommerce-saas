import { Module } from '@medusajs/framework/utils';
import StoreConfigModuleService from './service';

export const STORE_CONFIG_MODULE = 'storeConfigModuleService';

export default Module(STORE_CONFIG_MODULE, {
  service: StoreConfigModuleService,
});
