import { Injectable, Logger } from "@nestjs/common";
import * as nodemailer from 'nodemailer';

@Injectable()

export class NotificationService{
    private readonly logger = new Logger(NotificationService.name);
    private transporter;
    constructor(){
        this.transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false, // true for port 465, false for port 587 (STARTTLS)
            auth: {
                user: process.env.MAIL_USER,
                pass: process.env.MAIL_PASS,
            },
        });
    }

    async notifyDonor(donor:any , request :any): Promise<void>{
        try{
            await this.transporter.sendMail({
                from: process.env.MAIL_FROM,
                to: donor.email,
                subject : `🚨 Urgent: ${request.bloodType} blood needed ${donor.distance_km}km away`,
                html :`
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #dc2626; padding: 20px; text-align: center;">
              <h1 style="color: white; margin: 0;">🩸 BloodLink</h1>
              <p style="color: #fca5a5; margin: 5px 0;">Urgent Blood Request</p>
            </div>
            
            <div style="padding: 30px; background: #fff;">
              <p>Dear <strong>${donor.name}</strong>,</p>
              <p>An urgent blood request has been posted near you.</p>
              
              <div style="background: #fef2f2; border-left: 4px solid #dc2626; padding: 15px; margin: 20px 0;">
                <p style="margin: 5px 0;"><strong>Blood Type:</strong> ${request.bloodType}</p>
                <p style="margin: 5px 0;"><strong>Units Needed:</strong> ${request.units}</p>
                <p style="margin: 5px 0;"><strong>Hospital:</strong> ${request.hospital}</p>
                <p style="margin: 5px 0;"><strong>Address:</strong> ${request.address}</p>
                <p style="margin: 5px 0;"><strong>Distance:</strong> ${donor.distance_km} km from you</p>
                <p style="margin: 5px 0;"><strong>Urgency:</strong> ${request.urgency.toUpperCase()}</p>
              </div>

              <div style="text-align: center; margin: 30px 0;">
                <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/request/confirm/${request.id}" 
                   style="background: #dc2626; color: white; padding: 14px 28px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block; font-size: 16px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
                  Accept & Confirm Donation
                </a>
              </div>
              <p>Or if you prefer, you can reply to this email or contact the hospital directly.</p>
              <p style="color: #6b7280; font-size: 14px;">
                You received this because you are a registered donor within 10km of this request.
              </p>
            </div>
            
            <div style="background: #f9fafb; padding: 15px; text-align: center;">
              <p style="color: #6b7280; font-size: 12px; margin: 0;">
                BloodLink — Connecting donors with those in need
              </p>
            </div>
          </div>
            `,
            });
            this.logger.log(`Email sent to ${donor.name}(${donor.email})`);
        }catch(error){
            this.logger.error(`Failed to notify ${donor.email} : ${error.message}`);
        }
    }

    async notifyAllDonors(donors:any[], request:any): Promise<void>{
        const promise = donors.map(donor =>this.notifyDonor(donor,request));
        await Promise.allSettled(promise);
        this.logger.log(`Notified ${donors.length} donors for request ${request.id}`);
    }
}

