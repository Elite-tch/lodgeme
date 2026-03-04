import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

export async function POST(request: Request) {
    try {
        const { name, email, subject, message } = await request.json();

        // Validate inputs
        if (!name || !email || !subject || !message) {
            return NextResponse.json(
                { message: 'All fields are required.' },
                { status: 400 }
            );
        }

        // Create transporter
        // Note: For production, use environment variables for user/pass
        // For Gmail, you need to use an App Password
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER || 'izuchukwujohnbosco95@gmail.com',
                pass: process.env.EMAIL_PASS, // User must provide this in .env
            },
        });

        const mailOptions = {
            from: `"${name}" <${email}>`,
            to: process.env.EMAIL_RECEIVER || 'izuchukwujohnbosco95@gmail.com',
            subject: `LODGEME Contact: ${subject}`,
            html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
          <h2 style="color: #BB7655; border-bottom: 2px solid #BB7655; padding-bottom: 10px;">New Message from LODGEME</h2>
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> ${email}</p>
          <p><strong>Subject:</strong> ${subject}</p>
          <div style="margin-top: 20px; padding: 15px; background-color: #f9f9f9; border-radius: 5px;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap;">${message}</p>
          </div>
          <p style="margin-top: 30px; font-size: 12px; color: #888;">This email was sent from the LODGEME contact form.</p>
        </div>
      `,
        };

        await transporter.sendMail(mailOptions);

        return NextResponse.json({ message: 'Email sent successfully!' }, { status: 200 });
    } catch (error: any) {
        console.error('Nodemailer error:', error);
        return NextResponse.json(
            { message: 'Failed to send email. Please try again later.', error: error.message },
            { status: 500 }
        );
    }
}
