# 04 User Roles

## Role Model

The MVP seeds eight institutional roles. Each seeded user has a username, hashed password, role, organizational unit, and a JSON permission list that prepares the platform for a fuller RBAC implementation.

## Demo Credentials

| Role scenario | Username | Password |
| --- | --- | --- |
| مدير عام | `dg` | `Dg@2026` |
| مسؤول النظام | `admin` | `Admin@2026` |
| مدير إدارة التخطيط | `plan.manager` | `Manager@2026` |
| محلل تخطيط | `planner1` | `Planner@2026` |
| مسؤول متابعة | `monitor1` | `Monitor@2026` |
| مسؤول تدريب | `training1` | `Training@2026` |
| مستخدم بعثة | `riyadh1` | `Mission@2026` |
| قارئ فقط | `reader` | `Reader@2026` |

## Roles And Responsibilities

### مسؤول النظام

- configures the platform environment
- reviews repository and deployment readiness
- oversees institutional setup
- monitors alerts and platform integrity

### مدير عام

- consumes executive dashboard insights
- approves strategic plans and major workflows
- tracks institutional risk and progress
- reviews high-priority reports and escalations

### مدير إدارة

- supervises departmental plans and execution
- reviews submitted plans and reports
- approves nominations and workflow items
- resolves blockers and drives corrective action

### محلل تخطيط

- creates and maintains templates
- creates plans from templates
- manages plan hierarchies and KPI linkages
- coordinates strategic data quality

### مسؤول متابعة

- opens monitoring cycles
- records and reviews monitoring updates
- tracks delayed items and obstacles
- proposes corrective actions and closure decisions

### مسؤول تدريب

- creates training opportunities
- manages nomination windows
- tracks participation and post-training evidence
- coordinates capacity-building records

### مستخدم بعثة

- drafts and submits mission reports
- responds to reviewer comments
- participates in relevant training flows
- contributes mission-linked institutional knowledge

### قارئ فقط

- reads dashboards, plans, and knowledge content
- does not edit institutional records

## Demonstrated Role Flows In The MVP

- Administrator or planner creates a planning template
- Planning analyst creates a plan and configures nodes
- Department manager reviews and submits for approval
- Monitoring officer records cycle updates
- Mission user submits a report and receives return comments
- Training officer publishes a program and monitors nominations
- Director General reviews executive dashboard and approval queue

## Production Role Expansion

Recommended next steps:

- permission matrix by module and action
- organizational scope filters
- approval delegation rules
- temporary acting assignments
- record-level access policies
