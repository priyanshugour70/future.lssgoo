import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seed...');

  // Clear existing data
  console.log('Cleaning up existing data...');
  await prisma.auditLog.deleteMany({});
  await prisma.session.deleteMany({});
  await prisma.account.deleteMany({});
  await prisma.peopleContact.deleteMany({});
  await prisma.people.deleteMany({});
  await prisma.contactSource.deleteMany({});
  await prisma.company.deleteMany({});
  await prisma.accelerator.deleteMany({});
  await prisma.user.deleteMany({});

  // Create Admin User
  console.log('Creating admin user...');
  const adminPassword = await hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      email: 'admin@future.lssgoo.com',
      password: adminPassword,
      name: 'Admin User',
      role: 'ADMIN',
      authProvider: 'EMAIL',
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=admin',
      metadata: {
        department: 'Engineering',
        location: 'San Francisco',
        bio: 'Platform administrator',
      },
      lastLoginAt: new Date(),
    },
  });
  console.log('✅ Admin user created:', admin.email, '(password: admin123)');

  // Create Regular Users
  console.log('Creating regular users...');
  const user1Password = await hash('password123', 12);
  const user1 = await prisma.user.create({
    data: {
      email: 'john.doe@example.com',
      password: user1Password,
      name: 'John Doe',
      role: 'USER',
      authProvider: 'EMAIL',
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=john',
      metadata: {
        department: 'Marketing',
        location: 'New York',
        bio: 'Marketing specialist',
      },
      lastLoginAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
    },
  });
  console.log('✅ User created:', user1.email, '(password: password123)');

  const user2 = await prisma.user.create({
    data: {
      email: 'jane.smith@example.com',
      password: user1Password,
      name: 'Jane Smith',
      role: 'USER',
      authProvider: 'EMAIL',
      emailVerified: new Date(),
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=jane',
      metadata: {
        department: 'Sales',
        location: 'Los Angeles',
        bio: 'Sales manager',
      },
      lastLoginAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
    },
  });
  console.log('✅ User created:', user2.email, '(password: password123)');

  const user3 = await prisma.user.create({
    data: {
      email: 'mike.johnson@example.com',
      password: user1Password,
      name: 'Mike Johnson',
      role: 'USER',
      authProvider: 'EMAIL',
      emailVerified: null,
      avatarUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=mike',
      metadata: {
        department: 'Engineering',
        location: 'Austin',
        bio: 'Software developer',
      },
      lastLoginAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    },
  });
  console.log('✅ User created:', user3.email, '(password: password123)');

  // Create Sessions for active users
  console.log('Creating active sessions...');
  await prisma.session.create({
    data: {
      userId: admin.id,
      sessionToken: 'admin-token-' + Date.now(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      lastActiveAt: new Date(),
    },
  });

  await prisma.session.create({
    data: {
      userId: user1.id,
      sessionToken: 'user1-token-' + Date.now(),
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      lastActiveAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
    },
  });

  console.log('✅ Sessions created');

  // Create Audit Logs
  console.log('Creating audit logs...');
  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'UPDATE_ROLE',
      resource: 'USER',
      details: {
        targetUserId: user3.id,
        oldRole: 'USER',
        newRole: 'USER',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: admin.id,
      action: 'CREATE_USER',
      resource: 'USER',
      details: {
        targetUserId: user1.id,
        method: 'EMAIL',
      },
      ipAddress: '192.168.1.100',
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: user1.id,
      action: 'LOGIN',
      resource: 'AUTH',
      details: {
        provider: 'EMAIL',
        success: true,
      },
      ipAddress: '192.168.1.101',
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
  });

  console.log('✅ Audit logs created');

  // Create Accelerators
  console.log('Creating accelerators...');
  
  await prisma.accelerator.createMany({
    data: [
      {
        title: 'Y Combinator (YC)',
        description: 'The worlds most successful startup accelerator. Founded in 2005, Y Combinator has funded over 5,000 companies including Airbnb, Dropbox, Stripe, Reddit, and Coinbase.',
        whyItStandsOut: 'Founded in 2005. Has funded over 5,000 companies. Among its alumni are giants like Airbnb, Dropbox, Stripe. It\'s regarded as the benchmark accelerator. YC provides seed funding, advice, and connections to help startups succeed. The program includes a 3-month intensive bootcamp and Demo Day where companies present to investors.',
        averageFunding: '$125K - $500K',
        fundedCompanies: 5000,
        foundedYear: 2005,
        country: 'USA',
        type: 'Global',
        website: 'https://www.ycombinator.com',
      },
      {
        title: 'Techstars',
        description: 'A global accelerator with programs in 50+ cities worldwide. Founded in 2006, Techstars has supported thousands of startups with mentorship-driven programs.',
        whyItStandsOut: 'Founded 2006. Has supported thousands of startups globally. Strong global mentor network, many vertical/region-specific cohorts. Techstars runs industry-specific programs in fintech, IoT, retail, and more.',
        averageFunding: '$120K',
        fundedCompanies: 3500,
        foundedYear: 2006,
        country: 'USA',
        type: 'Global',
        website: 'https://www.techstars.com',
      },
      {
        title: '500 Global (formerly 500 Startups)',
        description: 'A global venture capital firm with a focus on emerging markets. Has invested in over 2,600 startups across 81 countries.',
        whyItStandsOut: 'Active very early globally — over 2,600 startups across 81 countries per some reports. Good option if you\'re more globally oriented. Known for their distribution-focused approach and diverse portfolio.',
        averageFunding: '$150K',
        fundedCompanies: 2600,
        foundedYear: 2010,
        country: 'USA',
        type: 'Global',
        website: 'https://500.co',
      },
      {
        title: 'Plug and Play Tech Center',
        description: 'One of the largest innovation platforms connecting startups with corporations. Operates in 50+ locations worldwide.',
        whyItStandsOut: 'Large network: says it connects tens of thousands of startups and many corporate partners. Spans many industries (fintech, insurtech etc). Strong corporate partnership model helps startups get enterprise customers.',
        averageFunding: '$100K - $500K',
        fundedCompanies: 1500,
        foundedYear: 2006,
        country: 'USA',
        type: 'Corporate Innovation',
        website: 'https://www.plugandplaytechcenter.com',
      },
      {
        title: 'SOSV',
        description: 'A multi-stage venture capital firm that runs various accelerator programs including HAX (hardware), IndieBio (biotech), and MOX (mobile).',
        whyItStandsOut: 'Runs various accelerator programs (hardware, biotech, frontier markets) and has a large global reach. Known for deep tech and frontier technology investments. Strong technical support for hardware and biotech startups.',
        averageFunding: '$200K - $300K',
        fundedCompanies: 1000,
        foundedYear: 1995,
        country: 'USA',
        type: 'Industry-specific',
        website: 'https://sosv.com',
      },
      {
        title: 'AngelPad',
        description: 'A selective San Francisco-based accelerator known for strong outcomes. Small class sizes ensure intensive mentorship.',
        whyItStandsOut: 'More selective, smaller class size, strong outcomes in terms of exits. Known for working with highly technical teams. Alumni include Postmates, Buffer, and many successful enterprise startups.',
        averageFunding: '$120K',
        fundedCompanies: 180,
        foundedYear: 2010,
        country: 'USA',
        type: 'Selective',
        website: 'https://angelpad.com',
      },
      {
        title: 'Alchemist Accelerator',
        description: 'Focused exclusively on enterprise-tech startups. Provides founders with deep expertise in B2B go-to-market strategies.',
        whyItStandsOut: 'Focused on enterprise-tech startups (rather than pure consumer). Good for B2B. Strong network of enterprise customers and corporate partners. Helps startups navigate complex enterprise sales cycles.',
        averageFunding: '$36K + $100K',
        fundedCompanies: 400,
        foundedYear: 2012,
        country: 'USA',
        type: 'Enterprise B2B',
        website: 'https://alchemistaccelerator.com',
      },
      {
        title: 'Seedcamp',
        description: 'Europe\'s leading seed-stage investor. Has backed over 400 companies including Revolut, TransferWise, and UiPath.',
        whyItStandsOut: 'Europe-centric but globally relevant. For early stage, strong investor network. Provides extensive support for international expansion. Known for hands-on approach and founder-friendly terms.',
        averageFunding: '$350K',
        fundedCompanies: 400,
        foundedYear: 2007,
        country: 'United Kingdom',
        type: 'Regional (Europe)',
        website: 'https://seedcamp.com',
      },
      {
        title: 'Entrepreneur First (EF)',
        description: 'A unique talent investor that helps individuals find co-founders and build companies from scratch. Over 600 companies in portfolio.',
        whyItStandsOut: '"Talent investor" style: help founders come together, build companies from scratch. Over 600 companies in portfolio. No idea required to join - EF helps you find co-founders and develop ideas. Strong track record in deep tech.',
        averageFunding: '$100K',
        fundedCompanies: 600,
        foundedYear: 2011,
        country: 'United Kingdom',
        type: 'Pre-idea',
        website: 'https://www.joinef.com',
      },
      {
        title: 'Founder Institute',
        description: 'The world\'s most proven network to turn ideas into fundable startups. Present in 200+ cities across 65 countries.',
        whyItStandsOut: 'More global reach, many countries, large volume – good if you are at an earlier stage. Part-time program allows founders to keep their day jobs while building. Focus on structured curriculum and peer support.',
        averageFunding: 'No equity investment',
        fundedCompanies: 5000,
        foundedYear: 2009,
        country: 'USA',
        type: 'Global/Part-time',
        website: 'https://fi.co',
      },
    ],
  });

  console.log('✅ Accelerators created');

  // Get accelerators for companies
  const accelerators = await prisma.accelerator.findMany();
  const ycId = accelerators.find(a => a.title.includes('Y Combinator'))?.id;
  const techstarsId = accelerators.find(a => a.title.includes('Techstars'))?.id;
  const global500Id = accelerators.find(a => a.title.includes('500 Global'))?.id;

  // Create Companies
  console.log('Creating companies...');
  
  await prisma.company.createMany({
    data: [
      {
        name: 'Airbnb',
        tagline: 'Book unique places to stay and things to do',
        description: 'Airbnb is a platform that connects people who want to rent out their homes with people who are looking for accommodations. It has revolutionized the travel industry.',
        companySize: '501+',
        techStack: ['React', 'Node.js', 'Ruby on Rails', 'PostgreSQL', 'AWS', 'Elasticsearch'],
        domain: 'Travel & Hospitality',
        sector: 'Travel Tech',
        vision: 'To create a world where anyone can belong anywhere.',
        foundedYear: 2008,
        website: 'https://www.airbnb.com',
        location: 'San Francisco, CA',
        fundingStage: 'IPO',
        acceleratorId: ycId,
      },
      {
        name: 'Stripe',
        tagline: 'Online payment processing for internet businesses',
        description: 'Stripe is a technology company that builds economic infrastructure for the internet. Businesses use Stripe to accept payments and manage operations online.',
        companySize: '501+',
        techStack: ['Ruby', 'Scala', 'Go', 'React', 'PostgreSQL', 'MongoDB'],
        domain: 'Financial Services',
        sector: 'FinTech',
        vision: 'To increase the GDP of the internet.',
        foundedYear: 2010,
        website: 'https://stripe.com',
        location: 'San Francisco, CA',
        fundingStage: 'Series D+',
        acceleratorId: ycId,
      },
      {
        name: 'Dropbox',
        tagline: 'Keep life organized and work moving—all in one place',
        description: 'Dropbox is a file hosting service that offers cloud storage, file synchronization, and client software.',
        companySize: '501+',
        techStack: ['Python', 'Go', 'TypeScript', 'React', 'PostgreSQL'],
        domain: 'Cloud Storage',
        sector: 'Enterprise Software',
        vision: 'To unleash the world\'s creative energy by designing a more enlightened way of working.',
        foundedYear: 2007,
        website: 'https://www.dropbox.com',
        location: 'San Francisco, CA',
        fundingStage: 'IPO',
        acceleratorId: ycId,
      },
      {
        name: 'Twilio',
        tagline: 'Customer engagement platform for communications',
        description: 'Twilio powers business communications, enabling phones, VoIP, and messaging to be embedded into software.',
        companySize: '501+',
        techStack: ['Java', 'Python', 'Node.js', 'React', 'PostgreSQL'],
        domain: 'Communications',
        sector: 'Communications Tech',
        vision: 'To fuel the future of communications.',
        foundedYear: 2008,
        website: 'https://www.twilio.com',
        location: 'San Francisco, CA',
        fundingStage: 'IPO',
        acceleratorId: techstarsId,
      },
      {
        name: 'SendGrid',
        tagline: 'Email delivery and marketing platform',
        description: 'SendGrid provides a cloud-based email delivery platform for businesses.',
        companySize: '201-500',
        techStack: ['Python', 'Go', 'Node.js', 'React', 'PostgreSQL'],
        domain: 'Email Services',
        sector: 'Marketing Tech',
        vision: 'To be the world\'s largest email delivery platform.',
        foundedYear: 2009,
        website: 'https://sendgrid.com',
        location: 'Denver, CO',
        fundingStage: 'IPO',
        acceleratorId: techstarsId,
      },
      {
        name: 'Canva',
        tagline: 'Design anything. Publish anywhere.',
        description: 'Canva is a graphic design platform that allows users to create visual content.',
        companySize: '501+',
        techStack: ['JavaScript', 'TypeScript', 'React', 'Python', 'Go'],
        domain: 'Design Software',
        sector: 'Creative Tools',
        vision: 'To empower everyone to design anything.',
        foundedYear: 2012,
        website: 'https://www.canva.com',
        location: 'Sydney, Australia',
        fundingStage: 'Series D+',
        acceleratorId: global500Id,
      },
      {
        name: 'Udemy',
        tagline: 'Online courses with real-world skills',
        description: 'Udemy is a global marketplace for learning and teaching online.',
        companySize: '501+',
        techStack: ['Python', 'Django', 'React', 'PostgreSQL', 'AWS'],
        domain: 'Education Technology',
        sector: 'EdTech',
        vision: 'To improve lives through learning.',
        foundedYear: 2010,
        website: 'https://www.udemy.com',
        location: 'San Francisco, CA',
        fundingStage: 'IPO',
        acceleratorId: global500Id,
      },
      {
        name: 'Notion',
        tagline: 'One workspace. Every team.',
        description: 'Notion is an all-in-one workspace that combines notes, tasks, wikis, and databases.',
        companySize: '201-500',
        techStack: ['TypeScript', 'React', 'Node.js', 'PostgreSQL'],
        domain: 'Productivity Software',
        sector: 'Enterprise Software',
        vision: 'To make toolmaking ubiquitous.',
        foundedYear: 2013,
        website: 'https://www.notion.so',
        location: 'San Francisco, CA',
        fundingStage: 'Series C',
        acceleratorId: ycId,
      },
      {
        name: 'Coinbase',
        tagline: 'The easiest place to buy and sell cryptocurrency',
        description: 'Coinbase is a digital currency exchange that makes it easy to buy, sell, and store cryptocurrency.',
        companySize: '501+',
        techStack: ['Ruby on Rails', 'Go', 'PostgreSQL', 'React', 'MongoDB'],
        domain: 'Cryptocurrency',
        sector: 'FinTech',
        vision: 'To create an open financial system for the world.',
        foundedYear: 2012,
        website: 'https://www.coinbase.com',
        location: 'San Francisco, CA',
        fundingStage: 'IPO',
        acceleratorId: ycId,
      },
      {
        name: 'Instacart',
        tagline: 'Groceries delivered in as little as 1 hour',
        description: 'Instacart is a grocery delivery and pick-up service.',
        companySize: '501+',
        techStack: ['Ruby on Rails', 'React', 'Python', 'PostgreSQL'],
        domain: 'E-commerce',
        sector: 'Delivery & Logistics',
        vision: 'To create a world where everyone has access to the food they love.',
        foundedYear: 2012,
        website: 'https://www.instacart.com',
        location: 'San Francisco, CA',
        fundingStage: 'IPO',
        acceleratorId: ycId,
      },
    ],
  });

  // Create Contact Sources for companies
  const companies = await prisma.company.findMany();
  await prisma.contactSource.createMany({
    data: companies.map(company => ({
      companyId: company.id,
      emails: [`contact@${company.website?.replace('https://www.', '').replace('https://', '') || 'example.com'}`],
      linkedin: `https://www.linkedin.com/company/${company.name.toLowerCase().replace(/\s+/g, '-')}`,
    })),
  });

  console.log('✅ Companies and contact sources created');

  // Create People
  console.log('Creating people...');
  
  await prisma.people.createMany({
    data: [
      {
        fullName: 'Brian Chesky',
        passion: 'Reimagining travel and creating a world where anyone can belong anywhere',
        bio: 'Co-founder and CEO of Airbnb. Designer turned entrepreneur passionate about creating meaningful travel experiences.',
        profileUrl: 'https://twitter.com/bchesky',
        notes: ['Forbes 30 Under 30', 'TIME 100 Most Influential People'],
        companyId: companies.find(c => c.name === 'Airbnb')?.id,
      },
      {
        fullName: 'Patrick Collison',
        passion: 'Building economic infrastructure for the internet',
        bio: 'Co-founder and CEO of Stripe. Interested in progress studies and making online payments accessible globally.',
        profileUrl: 'https://twitter.com/patrickc',
        notes: ['Youngest self-made billionaire', 'Started Stripe at age 19'],
        companyId: companies.find(c => c.name === 'Stripe')?.id,
      },
      {
        fullName: 'Drew Houston',
        passion: 'Simplifying the way people work together',
        bio: 'Co-founder and CEO of Dropbox. MIT graduate who built Dropbox to solve his own problem of forgetting his USB drive.',
        profileUrl: 'https://twitter.com/drewhouston',
        notes: ['Forbes Cloud 100', 'Built Dropbox to $1B+ revenue'],
        companyId: companies.find(c => c.name === 'Dropbox')?.id,
      },
      {
        fullName: 'Melanie Perkins',
        passion: 'Democratizing design and empowering creativity',
        bio: 'Co-founder and CEO of Canva. Started with a school yearbook design tool and grew it into a $40B design platform.',
        profileUrl: 'https://twitter.com/melcanva',
        notes: ['One of youngest female CEOs of tech unicorn', 'Built Canva to $40B valuation'],
        companyId: companies.find(c => c.name === 'Canva')?.id,
      },
      {
        fullName: 'Ivan Zhao',
        passion: 'Making software toolmaking ubiquitous',
        bio: 'Co-founder and CEO of Notion. Designer and engineer focused on empowering people to shape their own software.',
        profileUrl: 'https://twitter.com/ivanhzhao',
        notes: ['Built Notion over 6 years before launch', 'Combines design and engineering'],
        companyId: companies.find(c => c.name === 'Notion')?.id,
      },
    ],
  });

  // Create People Contacts
  const people = await prisma.people.findMany();
  await prisma.peopleContact.createMany({
    data: people.map(person => ({
      peopleId: person.id,
      linkedin: `https://www.linkedin.com/in/${person.fullName.toLowerCase().replace(/\s+/g, '-')}`,
      twitter: person.profileUrl || null,
      email: `${person.fullName.toLowerCase().replace(/\s+/g, '.')}@example.com`,
    })),
  });

  console.log('✅ People and contacts created');

  // Display summary
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('✅ Database seeded successfully!');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

  const userCount = await prisma.user.count();
  const sessionCount = await prisma.session.count();
  const auditLogCount = await prisma.auditLog.count();
  const acceleratorCount = await prisma.accelerator.count();
  const companyCount = await prisma.company.count();
  const contactSourceCount = await prisma.contactSource.count();
  const peopleCount = await prisma.people.count();
  const peopleContactCount = await prisma.peopleContact.count();

  console.log('📊 Summary:');
  console.log(`   Users: ${userCount}`);
  console.log(`   Sessions: ${sessionCount}`);
  console.log(`   Audit Logs: ${auditLogCount}`);
  console.log(`   Accelerators: ${acceleratorCount}`);
  console.log(`   Companies: ${companyCount}`);
  console.log(`   Contact Sources: ${contactSourceCount}`);
  console.log(`   People: ${peopleCount}`);
  console.log(`   People Contacts: ${peopleContactCount}`);
  console.log('');
  console.log('👤 Test Accounts (email/password):');
  console.log('   Admin: admin@future.lssgoo.com / admin123 (ADMIN)');
  console.log('   User 1: john.doe@example.com / password123 (USER)');
  console.log('   User 2: jane.smith@example.com / password123 (USER)');
  console.log('   User 3: mike.johnson@example.com / password123 (USER)');
  console.log('');
  console.log('💡 You can now sign in with these accounts!');
  console.log('🔐 Google OAuth is also available via NextAuth');
  console.log('');
}

main()
  .catch((e) => {
    console.error('❌ Error seeding database:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
