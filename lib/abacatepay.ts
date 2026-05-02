const BASE_URL = 'https://api.abacatepay.com/v2'

async function post(endpoint: string, body: object) {
  const res = await fetch(`${BASE_URL}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.ABACATEPAY_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(`AbacatePay ${res.status}: ${JSON.stringify(json)}`)
  }

  return json
}

export interface CreateBillingParams {
  returnUrl: string
  completionUrl: string
  externalId: string
}

export async function createBilling(params: CreateBillingParams) {
  return post('/subscriptions/create', {
    items: [
      {
        id: process.env.ABACATEPAY_PRODUCT_ID,
        quantity: 1,
      },
    ],
    returnUrl: params.returnUrl,
    completionUrl: params.completionUrl,
    externalId: params.externalId,
    methods: ['CARD'],
  })
}
