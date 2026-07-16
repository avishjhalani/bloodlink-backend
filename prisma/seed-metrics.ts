import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Cleaning existing data...');
  await prisma.donorNotification.deleteMany({});
  await prisma.bloodRequest.deleteMany({});
  await prisma.user.deleteMany({});

  console.log('🔑 Generating password hash...');
  const passwordHash = await bcrypt.hash('password123', 10);

  // 1. Seed Donors
  console.log('👥 Seeding donors...');
  const names = [
    'Rahul Sharma', 'Priya Patel', 'Amit Verma', 'Sneha Reddy', 'Vikram Singh',
    'Anjali Gupta', 'Rohan Mehta', 'Neha Kapoor', 'Sanjay Kumar', 'Deepika Rao',
    'Arjun Nair', 'Kriti Joshi', 'Manish Malhotra', 'Ritu Saxena', 'Karan Johar',
    'Ishita Bhalla', 'Aditya Roy', 'Pooja Hegde', 'Varun Dhawan', 'Shraddha Kapoor',
    'Ranbir Kapoor', 'Alia Bhatt', 'Siddharth Malhotra', 'Kiara Advani', 'Kartik Aaryan',
    'Sara Ali Khan', 'Vicky Kaushal', 'Katrina Kaif', 'Ranveer Singh', 'Deepika Padukone'
  ];

  const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

  // Base coordinates around Delhi, India
  const baseLat = 28.6139;
  const baseLng = 77.2090;

  const donors = [];
  for (let i = 0; i < names.length; i++) {
    // Distribute blood types realistically (O+ and A+ common, AB- rare)
    let bloodType = 'O+';
    if (i < 8) bloodType = 'O+';
    else if (i < 13) bloodType = 'A+';
    else if (i < 18) bloodType = 'B+';
    else if (i < 22) bloodType = 'O-';
    else if (i < 25) bloodType = 'A-';
    else if (i < 27) bloodType = 'B-';
    else if (i < 29) bloodType = 'AB+';
    else bloodType = 'AB-';

    const latOffset = (Math.random() - 0.5) * 0.15; // within ~15km
    const lngOffset = (Math.random() - 0.5) * 0.15;

    const donor = await prisma.user.create({
      data: {
        name: names[i],
        email: `${names[i].toLowerCase().replace(' ', '.')}@example.com`,
        password: passwordHash,
        bloodType,
        phone: `98765${String(i).padStart(5, '0')}`,
        lat: baseLat + latOffset,
        lng: baseLng + lngOffset,
        reliabilityScore: parseFloat((0.8 + Math.random() * 0.2).toFixed(2)),
        totalDonations: Math.floor(Math.random() * 8),
        isAvailable: Math.random() > 0.15,
        createdAt: new Date(Date.now() - Math.random() * 60 * 24 * 60 * 60 * 1000), // joined last 60 days
      },
    });
    donors.push(donor);
  }
  console.log(`✅ Seeded ${donors.length} donors.`);

  // 2. Seed Blood Requests
  console.log('🚨 Seeding blood requests...');
  const hospitals = [
    'Fortis Flt. Lt. Rajan Dhall Hospital',
    'Max Super Speciality Hospital, Saket',
    'Indraprastha Apollo Hospitals',
    'Sir Ganga Ram Hospital',
    'Medanta - The Medicity',
    'BLK-Max Super Speciality Hospital',
    'AIIMS New Delhi',
    'Ram Manohar Lohia Hospital',
    'Moolchand Medcity'
  ];

  const urgencies = ['critical', 'urgent', 'normal'];

  const requests = [];
  // Generate 20 historical requests over the last 30 days
  for (let i = 0; i < 20; i++) {
    const requester = donors[Math.floor(Math.random() * donors.length)];
    const hospital = hospitals[i % hospitals.length];
    const bloodType = bloodTypes[i % bloodTypes.length];
    const urgency = urgencies[i % urgencies.length];
    
    // Most requests are fulfilled in history
    let status = 'fulfilled';
    if (i === 17 || i === 18) status = 'active';
    if (i === 19) status = 'cancelled';

    const latOffset = (Math.random() - 0.5) * 0.1;
    const lngOffset = (Math.random() - 0.5) * 0.1;

    // Distribute request dates across past 30 days
    const createdAt = new Date(Date.now() - (19 - i) * 1.5 * 24 * 60 * 60 * 1000 - Math.random() * 12 * 60 * 60 * 1000);

    const request = await prisma.bloodRequest.create({
      data: {
        requesterId: requester.id,
        bloodType,
        units: 1 + Math.floor(Math.random() * 4),
        hospital,
        address: `${hospital}, New Delhi, India`,
        lat: baseLat + latOffset,
        lng: baseLng + lngOffset,
        urgency,
        status,
        createdAt,
        updatedAt: new Date(createdAt.getTime() + Math.random() * 24 * 60 * 60 * 1000),
      },
    });
    requests.push(request);
  }
  console.log(`✅ Seeded ${requests.length} blood requests.`);

  // 3. Seed Donor Notifications & Confirmations
  console.log('🔔 Seeding notifications and responses...');
  for (const request of requests) {
    // Notify 3-6 random donors
    const notifiedDonorsCount = 3 + Math.floor(Math.random() * 4);
    const shuffledDonors = [...donors].sort(() => 0.5 - Math.random());
    const targetDonors = shuffledDonors.slice(0, notifiedDonorsCount);

    let confirmedCount = 0;

    for (const donor of targetDonors) {
      // Exclude requester
      if (donor.id === request.requesterId) continue;

      let status = 'notified';
      let respondedAt = null;

      if (request.status === 'fulfilled') {
        // High chance of confirmation/completion for fulfilled requests
        const roll = Math.random();
        if (roll < 0.4) {
          status = 'completed';
          respondedAt = new Date(request.createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000); // responded within 2 hours
          confirmedCount++;
        } else if (roll < 0.7) {
          status = 'confirmed';
          respondedAt = new Date(request.createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000);
          confirmedCount++;
        } else {
          status = 'declined';
          respondedAt = new Date(request.createdAt.getTime() + Math.random() * 4 * 60 * 60 * 1000);
        }
      } else if (request.status === 'active') {
        // Active requests have some notified, some confirmed
        const roll = Math.random();
        if (roll < 0.3) {
          status = 'confirmed';
          respondedAt = new Date(request.createdAt.getTime() + Math.random() * 2 * 60 * 60 * 1000);
          confirmedCount++;
        } else if (roll < 0.5) {
          status = 'declined';
          respondedAt = new Date(request.createdAt.getTime() + Math.random() * 3 * 60 * 60 * 1000);
        }
      } else {
        // Cancelled requests have older notified/declined statuses
        status = Math.random() > 0.5 ? 'declined' : 'notified';
      }

      await prisma.donorNotification.create({
        data: {
          requestId: request.id,
          donorId: donor.id,
          status,
          notifiedAt: request.createdAt,
          respondedAt,
          distance: parseFloat((2 + Math.random() * 7).toFixed(2)), // 2-9 km away
        },
      });
    }

    // Update request count summaries
    await prisma.bloodRequest.update({
      where: { id: request.id },
      data: {
        donorsNotified: notifiedDonorsCount,
        donorsConfirmed: confirmedCount,
      },
    });
  }
  console.log('✅ Seeded all notifications.');
  console.log('🎉 Seeding successfully completed! Your analytics board is ready for display.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
