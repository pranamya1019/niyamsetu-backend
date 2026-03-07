const express = require('express')
const cors = require('cors')
const crypto = require('crypto')
const app = express()
app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': process.env.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify(req.body)
    })
    const data = await response.json()
    res.json(data)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/verify-payment', async (req, res) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature, plan, email } = req.body
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSig = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body.toString())
      .digest('hex')
    const isValid = expectedSig === razorpay_signature
    if (isValid) {
      console.log(`Payment verified for ${email} — Plan: ${plan}`)
      res.json({ success: true })
    } else {
      res.status(400).json({ success: false, error: 'Invalid signature' })
    }
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.post('/api/notify-signup', async (req, res) => {
  try {
    const { full_name, email, company_name, designation, whatsapp, business_type } = req.body
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.RESEND_API_KEY}`
      },
      body: JSON.stringify({
        from: 'onboarding@resend.dev',
        to: process.env.NOTIFY_EMAIL,
        subject: `New signup — ${full_name} from ${company_name}`,
        html: `<p><b>Name:</b> ${full_name}</p><p><b>Company:</b> ${company_name}</p><p><b>Email:</b> ${email}</p>`
      })
    })
    res.json({ success: true })
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('NiyamSetu backend running on port', process.env.PORT || 3000)
})
