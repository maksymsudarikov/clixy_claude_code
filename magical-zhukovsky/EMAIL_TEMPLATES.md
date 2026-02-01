# 📧 EMAIL TEMPLATES ДЛЯ GIFT CARDS

## 1. Email для ПОКУПАТЕЛЯ после оплаты

**Тема:** Your Clixy Gift Card is Ready! 🎁

**Текст:**
```
Hi [Purchaser Name],

Thank you for your purchase! Your gift card payment has been confirmed.

📸 GIFT CARD DETAILS:
━━━━━━━━━━━━━━━━━━━━
Code: [CLIXY-XXXX-XXXX-XXXX]
Package: [Package Name]
Value: $[Amount] USD
Recipient: [Recipient Name]
━━━━━━━━━━━━━━━━━━━━

NEXT STEPS:
• This gift card will be sent to [Recipient Email] on [Delivery Date]
• The recipient will receive instructions on how to book their photoshoot
• Valid until: [Expiry Date]

BOOKING INSTRUCTIONS FOR RECIPIENT:
1. Contact us via WhatsApp: +1 347-933-5770
2. Provide gift card code: [CODE]
3. Schedule your photoshoot date
4. Enjoy your professional photoshoot!

Questions? Contact us:
📧 Email: maksym.sudarikov@gmail.com
📱 WhatsApp: +1 347-933-5770

Thank you for choosing Clixy!
Studio Olga Prudka®

━━━━━━━━━━━━━━━━━━━━
This gift card is non-refundable and valid for 12 months from purchase date.
```

---

## 2. Email для ПОЛУЧАТЕЛЯ (когда отправляется gift card)

**Тема:** 🎁 You've Received a Gift Card from [Purchaser Name]!

**Текст:**
```
Hello [Recipient Name],

Congratulations! [Purchaser Name] has gifted you a professional photoshoot with Clixy!

🎁 YOUR GIFT CARD:
━━━━━━━━━━━━━━━━━━━━
Code: [CLIXY-XXXX-XXXX-XXXX]
Package: [Package Name]
Value: $[Amount] USD
Valid Until: [Expiry Date]
━━━━━━━━━━━━━━━━━━━━

[Personal Message from Purchaser]

HOW TO USE YOUR GIFT CARD:
━━━━━━━━━━━━━━━━━━━━

Step 1: Contact us to book your session
📱 WhatsApp: +1 347-933-5770
📧 Email: maksym.sudarikov@gmail.com

Step 2: Provide your gift card code
Use code: [CLIXY-XXXX-XXXX-XXXX]

Step 3: Schedule your photoshoot
Choose a date that works for you

Step 4: Enjoy your session!
Professional photography by Studio Olga Prudka®

WHAT'S INCLUDED:
✓ [Duration] photoshoot session
✓ [Number] professionally edited photos
✓ [Location] session
✓ High-resolution digital files

Questions? We're here to help!
📧 maksym.sudarikov@gmail.com
📱 +1 347-933-5770

We can't wait to create amazing photos with you!

Best regards,
Olga Prudka
Studio Olga Prudka®
━━━━━━━━━━━━━━━━━━━━
```

---

## 3. Как отправлять эти emails?

### Вариант A: Вручную (сейчас)
1. Когда клиент оплачивает (через Venmo/PayPal/etc)
2. Ты видишь gift card в Supabase Dashboard
3. Копируешь template выше
4. Заменяешь [CODE], [Name], etc.
5. Отправляешь через Gmail/Outlook

### Вариант B: Автоматически (настроить позже)
Можно использовать:
- **Supabase Edge Functions** + **SendGrid/Resend** (бесплатно до 100 emails/день)
- **Zapier** (если оплата через Stripe/PayPal)
- **n8n** (бесплатный аналог Zapier, self-hosted)

---

## 4. Процесс оплаты (что сейчас?)

**Текущий flow:**
1. Клиент заполняет форму → видит Success страницу
2. Success страница показывает: "Contact us on WhatsApp to complete payment"
3. Клиент пишет в WhatsApp с кодом gift card
4. Ты принимаешь оплату (Venmo/Zelle/Cash/etc)
5. **Вручную отправляешь email покупателю** (template выше)
6. **В дату доставки** отправляешь email получателю

**Что можно автоматизировать:**
- [ ] Автоматический email покупателю после оплаты
- [ ] Автоматический email получателю в нужную дату
- [ ] Напоминание получателю за неделю до expiry

---

## 5. Рекомендация для быстрого старта

**Сейчас используй вручную:**
1. Сохрани templates выше в Notes/Notion
2. Когда получаешь оплату → копируй template
3. Заменяй переменные на реальные данные
4. Отправляй через Gmail

**Позже можем автоматизировать** через:
- Supabase Functions (когда status меняется на "paid")
- Scheduled delivery (отправка в нужную дату)
- Expiry reminders

Хочешь чтобы я помог настроить автоматическую отправку?
