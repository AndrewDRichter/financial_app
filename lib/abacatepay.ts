const BASE_URL = 'https://api.abacatepay.com/v1'

async function post(endpoint: string, body: object) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text()
    throw new Error(`AbacatePay ${res.status}: ${text}`)
  }

  return res.json()
}

export interface CreateBillingParams {
  returnUrl: string
  completionUrl: string
  customerName: string
  customerEmail: string
  externalId: string
}

export async function createBilling(params: CreateBillingParams) {
  return post('/billing/createOne', {
    frequency: 'MONTHLY',
    methods: ['PIX', 'CREDIT_CARD'],
    products: [
      {
        externalId: process.env.ABACATEPAY_PRODUCT_ID,
        name: 'FinanceApp Pro — Mensal',
        quantity: 1,
        price: Number(process.env.ABACATEPAY_PRICE_CENTS ?? 990),
      },
    ],
    customer: {
      name: params.customerName,
      email: params.customerEmail,
    },
    returnUrl: params.returnUrl,
    completionUrl: params.completionUrl,
    externalId: params.externalId,
  })
}
