import { prisma } from "@/lib/prisma";

const planNodeInclude = {
  templateLevel: true,
  owner: true,
  kpiLinks: {
    include: {
      kpi: true
    }
  }
} as const;

function buildNodeMap<T extends { id: string; parentId: string | null }>(items: T[]) {
  const map = new Map<string, T & { children: (T & { children: unknown[] })[] }>();

  for (const item of items) {
    map.set(item.id, { ...item, children: [] });
  }

  const roots: Array<T & { children: (T & { children: unknown[] })[] }> = [];

  for (const item of items) {
    const current = map.get(item.id);

    if (!current) continue;

    if (item.parentId) {
      const parent = map.get(item.parentId);

      if (parent) {
        parent.children.push(current);
      } else {
        roots.push(current);
      }
    } else {
      roots.push(current);
    }
  }

  return roots;
}

export async function getNotificationsForUser(userId: string) {
  return prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 6
  });
}

export async function getDashboardData(userId: string) {
  const [
    plans,
    pendingApprovals,
    overdueInitiatives,
    missionReports,
    kpis,
    trainingPrograms,
    notifications,
    recentActivity
  ] = await Promise.all([
    prisma.plan.findMany({
      where: {
        status: {
          in: ["UNDER_REVIEW", "APPROVED", "SUBMITTED"]
        }
      },
      include: {
        initiatives: true,
        organizationalUnit: true
      },
      orderBy: { updatedAt: "desc" },
      take: 5
    }),
    prisma.approvalRequest.findMany({
      where: {
        OR: [{ assignedToId: userId }, { status: "PENDING" }]
      },
      include: {
        requester: true,
        assignedTo: true
      },
      orderBy: { requestedAt: "desc" },
      take: 6
    }),
    prisma.initiative.findMany({
      where: {
        endDate: { lt: new Date() },
        progressPercent: { lt: 100 }
      },
      include: {
        owner: true,
        plan: true
      },
      orderBy: { endDate: "asc" },
      take: 6
    }),
    prisma.missionReport.findMany({
      where: {
        status: { in: ["SUBMITTED", "UNDER_REVIEW", "RETURNED"] }
      },
      include: {
        submittedBy: true
      },
      orderBy: { updatedAt: "desc" },
      take: 6
    }),
    prisma.kPI.findMany({
      orderBy: { updatedAt: "desc" },
      take: 12
    }),
    prisma.trainingProgram.findMany({
      include: {
        nominations: true
      },
      orderBy: { startDate: "asc" },
      take: 4
    }),
    getNotificationsForUser(userId),
    prisma.auditLog.findMany({
      orderBy: { createdAt: "desc" },
      take: 8
    })
  ]);

  const healthyKpis = kpis.filter(
    (item: (typeof kpis)[number]) => item.status === "HEALTHY"
  ).length;
  const watchKpis = kpis.filter(
    (item: (typeof kpis)[number]) => item.status === "WATCH"
  ).length;
  const criticalKpis = kpis.filter(
    (item: (typeof kpis)[number]) => item.status === "CRITICAL"
  ).length;

  return {
    metrics: {
      activePlans: plans.length,
      pendingApprovals: pendingApprovals.filter(
        (item: (typeof pendingApprovals)[number]) => item.status === "PENDING"
      ).length,
      overdueItems: overdueInitiatives.length,
      pendingReports: missionReports.length,
      healthyKpis,
      trainingSeats: trainingPrograms.reduce(
        (sum: number, item: (typeof trainingPrograms)[number]) => sum + item.seats,
        0
      )
    },
    plans,
    pendingApprovals,
    overdueInitiatives,
    missionReports,
    kpiHealth: [
      { name: "صحي", value: healthyKpis },
      { name: "يتطلب متابعة", value: watchKpis },
      { name: "حرج", value: criticalKpis }
    ],
    trainingPrograms,
    notifications,
    recentActivity,
    progressTrend: plans.map((plan: (typeof plans)[number]) => ({
      name: plan.periodLabel,
      value:
        plan.initiatives.length > 0
          ? Math.round(
              plan.initiatives.reduce(
                (sum: number, item: (typeof plan.initiatives)[number]) =>
                  sum + item.progressPercent,
                0
              ) /
                plan.initiatives.length
            )
          : 0
    }))
  };
}

export async function getTemplateList() {
  return prisma.template.findMany({
    include: {
      createdBy: true,
      levels: {
        orderBy: { levelOrder: "asc" }
      },
      fields: true,
      _count: {
        select: {
          plans: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getTemplateById(id: string) {
  return prisma.template.findUnique({
    where: { id },
    include: {
      createdBy: true,
      levels: {
        include: {
          fields: {
            orderBy: { fieldOrder: "asc" }
          }
        },
        orderBy: { levelOrder: "asc" }
      },
      approvalRequests: {
        include: {
          assignedTo: true
        },
        orderBy: { requestedAt: "desc" }
      }
    }
  });
}

export async function getPlanList() {
  return prisma.plan.findMany({
    include: {
      template: true,
      owner: true,
      organizationalUnit: true,
      nodes: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getPlanById(id: string) {
  const plan = await prisma.plan.findUnique({
    where: { id },
    include: {
      template: {
        include: {
          levels: {
            orderBy: { levelOrder: "asc" }
          }
        }
      },
      owner: true,
      createdBy: true,
      organizationalUnit: true,
      approvals: {
        include: {
          assignedTo: true,
          requester: true
        },
        orderBy: { requestedAt: "desc" }
      },
      initiatives: {
        include: {
          owner: true
        },
        orderBy: { updatedAt: "desc" }
      },
      nodes: {
        include: planNodeInclude,
        orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }]
      }
    }
  });

  if (!plan) return null;

  return {
    ...plan,
    tree: buildNodeMap(plan.nodes)
  };
}

export async function getInitiatives() {
  return prisma.initiative.findMany({
    include: {
      owner: true,
      plan: true,
      planNode: {
        include: {
          templateLevel: true
        }
      }
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getInitiativeById(id: string) {
  return prisma.initiative.findUnique({
    where: { id },
    include: {
      owner: true,
      plan: true,
      planNode: {
        include: {
          templateLevel: true,
          kpiLinks: {
            include: {
              kpi: true
            }
          }
        }
      },
      monitoringUpdates: {
        include: {
          submittedBy: true,
          cycle: true
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
}

export async function getKpis() {
  return prisma.kPI.findMany({
    include: {
      owner: true,
      nodeLinks: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getKpiById(id: string) {
  return prisma.kPI.findUnique({
    where: { id },
    include: {
      owner: true,
      nodeLinks: {
        include: {
          planNode: {
            include: {
              plan: true,
              templateLevel: true
            }
          }
        }
      },
      monitoringUpdates: {
        include: {
          cycle: true,
          submittedBy: true
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
}

export async function getMonitoringCycles() {
  return prisma.monitoringCycle.findMany({
    include: {
      plan: true,
      ownerUnit: true,
      updates: true
    },
    orderBy: { startDate: "desc" }
  });
}

export async function getMonitoringCycleById(id: string) {
  return prisma.monitoringCycle.findUnique({
    where: { id },
    include: {
      plan: true,
      createdBy: true,
      ownerUnit: true,
      approvals: {
        include: {
          assignedTo: true
        }
      },
      updates: {
        include: {
          submittedBy: true,
          initiative: true,
          kpi: true,
          planNode: {
            include: {
              templateLevel: true
            }
          }
        },
        orderBy: { updatedAt: "desc" }
      }
    }
  });
}

export async function getMissionReports() {
  return prisma.missionReport.findMany({
    include: {
      submittedBy: true,
      reviewer: true,
      organizationalUnit: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getMissionReportById(id: string) {
  return prisma.missionReport.findUnique({
    where: { id },
    include: {
      submittedBy: true,
      reviewer: true,
      organizationalUnit: true,
      comments: {
        include: {
          author: true
        },
        orderBy: { createdAt: "desc" }
      },
      approvals: {
        include: {
          assignedTo: true
        },
        orderBy: { requestedAt: "desc" }
      }
    }
  });
}

export async function getTrainingPrograms() {
  return prisma.trainingProgram.findMany({
    include: {
      createdBy: true,
      nominations: {
        include: {
          nominee: true
        }
      }
    },
    orderBy: { startDate: "asc" }
  });
}

export async function getTrainingProgramById(id: string) {
  return prisma.trainingProgram.findUnique({
    where: { id },
    include: {
      createdBy: true,
      organizationalUnit: true,
      nominations: {
        include: {
          nominee: true,
          manager: true
        },
        orderBy: { submittedAt: "desc" }
      },
      participations: {
        include: {
          participant: true
        },
        orderBy: { updatedAt: "desc" }
      },
      knowledgeDocs: true
    }
  });
}

export async function getKnowledgeDocuments(search?: string) {
  return prisma.knowledgeDocument.findMany({
    where: search
      ? {
          OR: [
            { titleAr: { contains: search, mode: "insensitive" } },
            { summary: { contains: search, mode: "insensitive" } },
            { tags: { has: search } }
          ]
        }
      : undefined,
    include: {
      uploadedBy: true,
      organizationalUnit: true,
      plan: true,
      missionReport: true,
      trainingProgram: true
    },
    orderBy: { updatedAt: "desc" }
  });
}

export async function getKnowledgeDocumentById(id: string) {
  return prisma.knowledgeDocument.findUnique({
    where: { id },
    include: {
      uploadedBy: true,
      organizationalUnit: true,
      plan: true,
      missionReport: true,
      trainingProgram: true
    }
  });
}

export async function getApprovals() {
  return prisma.approvalRequest.findMany({
    include: {
      requester: true,
      assignedTo: true,
      plan: true,
      missionReport: true,
      trainingNomination: {
        include: {
          nominee: true
        }
      },
      monitoringCycle: true,
      template: true
    },
    orderBy: { requestedAt: "desc" }
  });
}

export async function getUsersDirectory() {
  return prisma.user.findMany({
    include: {
      role: true,
      organizationalUnit: true,
      notifications: {
        where: {
          status: "UNREAD"
        }
      }
    },
    orderBy: [{ organizationalUnitId: "asc" }, { fullNameAr: "asc" }]
  });
}

export async function getSettingsData() {
  const [roles, units, templates] = await Promise.all([
    prisma.role.findMany({ orderBy: { nameAr: "asc" } }),
    prisma.organizationalUnit.findMany({ orderBy: [{ level: "asc" }, { nameAr: "asc" }] }),
    prisma.template.findMany({ orderBy: { updatedAt: "desc" }, take: 5 })
  ]);

  return { roles, units, templates };
}
