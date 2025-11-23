import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seeding...');

  // Create admin user
  const hashedPassword = await bcrypt.hash('admin123', 10);

  const admin = await prisma.user.upsert({
    where: { email: 'admin@invoicemanagement.com' },
    update: {},
    create: {
      email: 'admin@invoicemanagement.com',
      password: hashedPassword,
      firstName: 'Admin',
      lastName: 'User',
      role: 'ADMIN',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('Created admin user:', admin.email);

  // Create demo business user
  const demoPassword = await bcrypt.hash('demo123', 10);

  const demoUser = await prisma.user.upsert({
    where: { email: 'demo@business.com' },
    update: {},
    create: {
      email: 'demo@business.com',
      password: demoPassword,
      firstName: 'Demo',
      lastName: 'Business',
      role: 'BUSINESS_USER',
      emailVerified: true,
      isActive: true,
    },
  });

  console.log('Created demo user:', demoUser.email);

  // Create company for demo user
  const company = await prisma.company.create({
    data: {
      userId: demoUser.id,
      name: 'Demo Company Inc.',
      email: 'info@democompany.com',
      phone: '+1-555-0123',
      website: 'https://democompany.com',
      address: '123 Business Street',
      city: 'New York',
      state: 'NY',
      country: 'USA',
      zipCode: '10001',
      taxId: 'TAX-123456',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
    },
  });

  console.log('Created company:', company.name);

  // Create sample customers
  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'Acme Corporation',
        email: 'contact@acme.com',
        phone: '+1-555-0124',
        company: 'Acme Corp',
        address: '456 Client Avenue',
        city: 'Los Angeles',
        state: 'CA',
        country: 'USA',
        zipCode: '90001',
      },
    }),
    prisma.customer.create({
      data: {
        userId: demoUser.id,
        name: 'TechStart Solutions',
        email: 'hello@techstart.com',
        phone: '+1-555-0125',
        company: 'TechStart LLC',
        address: '789 Innovation Drive',
        city: 'San Francisco',
        state: 'CA',
        country: 'USA',
        zipCode: '94102',
      },
    }),
  ]);

  console.log('Created customers:', customers.length);

  // Create invoice template
  const template = await prisma.invoiceTemplate.create({
    data: {
      userId: demoUser.id,
      name: 'Modern Template',
      description: 'Clean and professional invoice template',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      layout: 'modern',
      isDefault: true,
      defaultTerms: 'Payment is due within 30 days of invoice date.',
      defaultNotes: 'Thank you for your business!',
    },
  });

  console.log('Created invoice template:', template.name);

  // Create sample invoice
  const invoice = await prisma.invoice.create({
    data: {
      invoiceNumber: 'INV-2025-001',
      userId: demoUser.id,
      companyId: company.id,
      customerId: customers[0].id,
      status: 'SENT',
      issueDate: new Date(),
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
      subtotal: 1000.00,
      taxRate: 10.00,
      taxAmount: 100.00,
      discountType: 'PERCENTAGE',
      discountValue: 5.00,
      discountAmount: 50.00,
      totalAmount: 1050.00,
      notes: 'Thank you for your business!',
      terms: 'Payment is due within 30 days.',
      templateId: template.id,
      items: {
        create: [
          {
            description: 'Web Development Services',
            quantity: 40,
            unitPrice: 50.00,
            amount: 2000.00,
            order: 1,
          },
          {
            description: 'Consulting Services',
            quantity: 10,
            unitPrice: 100.00,
            amount: 1000.00,
            order: 2,
          },
        ],
      },
    },
  });

  console.log('Created sample invoice:', invoice.invoiceNumber);

  // Create default theme
  const theme = await prisma.theme.create({
    data: {
      userId: demoUser.id,
      name: 'Default Light',
      mode: 'LIGHT',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      accentColor: '#F59E0B',
      backgroundColor: '#FFFFFF',
      textColor: '#111827',
      isActive: true,
    },
  });

  console.log('Created default theme:', theme.name);

  console.log('Database seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
