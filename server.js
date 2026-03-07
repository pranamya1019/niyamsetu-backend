const express = require('express')
const cors = require('cors')
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

app.post('/api/notify-signup', async (req, res) => {
  try {
    const { full_name, email, company_name, designation, whatsapp, business_type } = req.body
    const nodemailer = require('nodemailer')
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS
      }
    })
    await transporter.sendMail({
      from: `"NiyamSetu" <${process.env.GMAIL_USER}>`,
      to: 'pranamya1019@gmail.com',
      subject: `🎉 New signup — ${full_name} from ${company_name}`,
      html: `<div style="font-family:sans-serif;max-width:500px;padding:2rem;background:#f9f9f9;border-radius:12px;">
        <h2 style="color:#E8720C;">🎉 New NiyamSetu Signup!</h2>
        <table style="width:100%;border-collapse:collapse;">
          <tr><td style="padding:8px 0;color:#666;">Name</td><td style="font-weight:600;">${full_name}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Company</td><td style="font-weight:600;">${company_name}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Email</td><td style="font-weight:600;">${email}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">WhatsApp</td><td style="font-weight:600;">${whatsapp || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Designation</td><td style="font-weight:600;">${designation || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Business Type</td><td style="font-weight:600;">${business_type || '—'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Signed up</td><td style="font-weight:600;">${new Date().toLocaleString('en-IN', {timeZone:'Asia/Kolkata'})}</td></tr>
        </table>
      </div>`
    })
    res.json({ success: true })
  } catch (err) {
    console.error('Email error:', err)
    res.status(500).json({ error: err.message })
  }
})

app.listen(process.env.PORT || 3000, () => {
  console.log('NiyamSetu backend running on port', process.env.PORT || 3000)
})
