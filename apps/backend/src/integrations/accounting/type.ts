export type AccountingProduct = {
  sku: string
  priceToman: number
  stockedQuantity: number
}

export type AccountingCustomer = {
  externalId: string
  name: string
  phone?: string
  email?: string
  nationalId?: string
}

export type AccountingOrderItem = {
  sku: string
  quantity: number
  priceToman: number
}

export type AccountingOrder = {
  externalId: string
  customer?: AccountingCustomer
  items: AccountingOrderItem[]
  totalToman: number
  note?: string
}

export type AccountingOrderResult = {
  externalId: string
  invoiceNumber?: string
}

export interface AccountingProvider {
  login(): Promise<string>

  getProducts(input: {
    token: string
    offset: number
    limit: number
  }): Promise<AccountingProduct[]>

  getProduct?(input: {
    token: string
    sku: string
  }): Promise<AccountingProduct | null>

  getStock?(input: {
    token: string
    sku: string
  }): Promise<number>

  getCustomers?(input: {
    token: string
    offset: number
    limit: number
  }): Promise<AccountingCustomer[]>

  createOrder?(input: {
    token: string
    order: AccountingOrder
  }): Promise<AccountingOrderResult>

  cancelOrder?(input: {
    token: string
    externalOrderId: string
  }): Promise<void>
}
