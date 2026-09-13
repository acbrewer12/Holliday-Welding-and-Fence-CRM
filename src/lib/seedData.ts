import type { PrismaClient } from "@prisma/client";

export async function resetAndSeed(prisma: PrismaClient) {
  await prisma.jobMaterial.deleteMany();
  await prisma.scheduleEvent.deleteMany();
  await prisma.invoiceItem.deleteMany();
  await prisma.invoice.deleteMany();
  await prisma.estimateItem.deleteMany();
  await prisma.estimate.deleteMany();
  await prisma.job.deleteMany();
  await prisma.material.deleteMany();
  await prisma.customer.deleteMany();

  const materials = await Promise.all([
    prisma.material.create({
      data: { name: '6ft Wood Privacy Panel', category: "FENCE_PANEL", unit: "panel", unitCost: 45 },
    }),
    prisma.material.create({
      data: { name: '4in Metal Fence Post (8ft)', category: "POST", unit: "post", unitCost: 22 },
    }),
    prisma.material.create({
      data: { name: 'Walk Gate w/ Hardware', category: "GATE", unit: "ea", unitCost: 165 },
    }),
    prisma.material.create({
      data: { name: "Concrete (60lb bag)", category: "CONCRETE", unit: "bag", unitCost: 6.5 },
    }),
    prisma.material.create({
      data: { name: "7018 Welding Rod (10lb box)", category: "WELDING_ROD", unit: "box", unitCost: 38 },
    }),
    prisma.material.create({
      data: { name: '1.5in Square Tube Steel (20ft)', category: "METAL_STOCK", unit: "length", unitCost: 54 },
    }),
    prisma.material.create({
      data: { name: "Gate Hinges (heavy duty pair)", category: "HARDWARE", unit: "pair", unitCost: 19 },
    }),
  ]);

  const customers = await Promise.all([
    prisma.customer.create({
      data: {
        name: "Dale Harmon",
        email: "dale.harmon@example.com",
        phone: "(555) 201-8834",
        address: "412 Ranch Road",
        city: "Weatherford",
        state: "TX",
        zip: "76086",
        notes: "Prefers text over calls. Has two dogs, keep gate closed.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Bluebonnet Storage LLC",
        email: "ops@bluebonnetstorage.example.com",
        phone: "(555) 340-1122",
        address: "8800 Commerce Dr",
        city: "Aledo",
        state: "TX",
        zip: "76008",
        notes: "Commercial account. Net 30 terms.",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Priya Natarajan",
        email: "priya.n@example.com",
        phone: "(555) 774-2290",
        address: "27 Live Oak Ct",
        city: "Willow Park",
        state: "TX",
        zip: "76087",
      },
    }),
    prisma.customer.create({
      data: {
        name: "Marcus Webb",
        email: "mwebb@example.com",
        phone: "(555) 618-0043",
        address: "5521 County Rd 102",
        city: "Weatherford",
        state: "TX",
        zip: "76088",
        notes: "Referred by Dale Harmon.",
      },
    }),
  ]);

  const now = new Date();
  const inDays = (n: number) => new Date(now.getTime() + n * 24 * 60 * 60 * 1000);

  const job1 = await prisma.job.create({
    data: {
      title: "Backyard privacy fence - 180ft",
      type: "FENCE",
      status: "IN_PROGRESS",
      description: "Install wood privacy fence around back and side yard, one walk gate.",
      address: "412 Ranch Road, Weatherford, TX",
      scheduledStart: inDays(-2),
      scheduledEnd: inDays(1),
      customerId: customers[0].id,
    },
  });

  const job2 = await prisma.job.create({
    data: {
      title: "Perimeter security fence - storage lot",
      type: "FENCE",
      status: "SCHEDULED",
      description: "Commercial chain-link and steel perimeter fence around storage lot expansion.",
      address: "8800 Commerce Dr, Aledo, TX",
      scheduledStart: inDays(5),
      scheduledEnd: inDays(9),
      customerId: customers[1].id,
    },
  });

  const job3 = await prisma.job.create({
    data: {
      title: "Custom steel driveway gate",
      type: "WELDING",
      status: "QUOTED",
      description: "Fabricate and install custom double-swing steel driveway gate with automation-ready hinges.",
      address: "27 Live Oak Ct, Willow Park, TX",
      customerId: customers[2].id,
    },
  });

  const job4 = await prisma.job.create({
    data: {
      title: "Repair storm-damaged fence section",
      type: "REPAIR",
      status: "LEAD",
      description: "Two sections of fence down after storm, needs assessment and repair quote.",
      address: "5521 County Rd 102, Weatherford, TX",
      customerId: customers[3].id,
    },
  });

  const job5 = await prisma.job.create({
    data: {
      title: "Trailer hitch and rail welding repair",
      type: "WELDING",
      status: "COMPLETED",
      description: "Weld repair on cracked trailer frame and add reinforcement rail.",
      address: "412 Ranch Road, Weatherford, TX",
      scheduledStart: inDays(-14),
      scheduledEnd: inDays(-14),
      customerId: customers[0].id,
    },
  });

  await prisma.jobMaterial.createMany({
    data: [
      { jobId: job1.id, materialId: materials[0].id, quantity: 30, unitCostAtTime: materials[0].unitCost },
      { jobId: job1.id, materialId: materials[1].id, quantity: 16, unitCostAtTime: materials[1].unitCost },
      { jobId: job1.id, materialId: materials[2].id, quantity: 1, unitCostAtTime: materials[2].unitCost },
      { jobId: job1.id, materialId: materials[3].id, quantity: 16, unitCostAtTime: materials[3].unitCost },
      { jobId: job2.id, materialId: materials[1].id, quantity: 40, unitCostAtTime: materials[1].unitCost },
      { jobId: job2.id, materialId: materials[3].id, quantity: 40, unitCostAtTime: materials[3].unitCost },
      { jobId: job3.id, materialId: materials[5].id, quantity: 4, unitCostAtTime: materials[5].unitCost },
      { jobId: job3.id, materialId: materials[6].id, quantity: 2, unitCostAtTime: materials[6].unitCost },
      { jobId: job5.id, materialId: materials[4].id, quantity: 1, unitCostAtTime: materials[4].unitCost },
    ],
  });

  const estimate1 = await prisma.estimate.create({
    data: {
      number: "EST-2026-0001",
      status: "ACCEPTED",
      jobId: job1.id,
      issuedDate: inDays(-10),
      expiryDate: inDays(20),
      items: {
        create: [
          { description: "6ft Wood Privacy Panel install", quantity: 30, unit: "panel", unitPrice: 95 },
          { description: "Metal fence post, set in concrete", quantity: 16, unit: "post", unitPrice: 48 },
          { description: "Walk gate install", quantity: 1, unit: "ea", unitPrice: 320 },
        ],
      },
    },
  });

  await prisma.estimate.create({
    data: {
      number: "EST-2026-0002",
      status: "SENT",
      jobId: job2.id,
      issuedDate: inDays(-3),
      expiryDate: inDays(27),
      items: {
        create: [
          { description: "Chain-link perimeter fence install", quantity: 400, unit: "ft", unitPrice: 18.5 },
          { description: "Steel gate post, heavy duty", quantity: 2, unit: "post", unitPrice: 140 },
        ],
      },
    },
  });

  await prisma.estimate.create({
    data: {
      number: "EST-2026-0003",
      status: "DRAFT",
      jobId: job3.id,
      issuedDate: now,
      expiryDate: inDays(30),
      items: {
        create: [
          { description: "Custom steel gate fabrication", quantity: 1, unit: "ea", unitPrice: 2400 },
          { description: "Installation and site work", quantity: 1, unit: "ea", unitPrice: 650 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-2026-0001",
      status: "PAID",
      jobId: job5.id,
      issuedDate: inDays(-13),
      dueDate: inDays(-3),
      items: {
        create: [
          { description: "Trailer frame weld repair", quantity: 3, unit: "hr", unitPrice: 95 },
          { description: "Reinforcement rail fabrication", quantity: 1, unit: "ea", unitPrice: 180 },
        ],
      },
    },
  });

  await prisma.invoice.create({
    data: {
      number: "INV-2026-0002",
      status: "SENT",
      jobId: job1.id,
      estimateId: estimate1.id,
      issuedDate: inDays(-1),
      dueDate: inDays(14),
      items: {
        create: [
          { description: "6ft Wood Privacy Panel install", quantity: 30, unit: "panel", unitPrice: 95 },
          { description: "Metal fence post, set in concrete", quantity: 16, unit: "post", unitPrice: 48 },
          { description: "Walk gate install", quantity: 1, unit: "ea", unitPrice: 320 },
        ],
      },
    },
  });

  await prisma.scheduleEvent.createMany({
    data: [
      {
        title: "Fence install crew - Harmon backyard",
        start: inDays(0),
        end: inDays(0.3),
        crew: "Crew A",
        jobId: job1.id,
      },
      {
        title: "Site walk - Bluebonnet Storage perimeter",
        start: inDays(4),
        end: inDays(4.2),
        crew: "Estimator",
        jobId: job2.id,
      },
      {
        title: "Perimeter fence install - Bluebonnet",
        start: inDays(5),
        end: inDays(9),
        crew: "Crew A + Crew B",
        jobId: job2.id,
      },
      {
        title: "Storm damage assessment - Webb property",
        start: inDays(2),
        end: inDays(2.1),
        crew: "Estimator",
        jobId: job4.id,
      },
    ],
  });

  return { customers: customers.length, materials: materials.length };
}
