# 05 Modules And Workflows

## Implemented Modules

### 1. Authentication And Role Context

- demo login experience with seeded users
- cookie-based role context
- institutional role and unit awareness in layout

### 2. Executive Dashboard

- active plans
- pending approvals
- overdue execution items
- pending mission reports
- KPI health summary
- training participation capacity
- recent activity feed
- notifications
- quick actions

### 3. Dynamic Template Engine

- template list
- template detail
- template creation
- ordered dynamic levels
- status and scope metadata
- preview-oriented detail view

### 4. Planning Module

- plan list
- create plan from template
- plan detail
- hierarchical plan tree
- add, update, delete, reorder by sort order
- assign owners
- set dates
- track progress
- link KPIs
- submit for approval

### 5. Initiatives And Actions

- initiative registry
- owner assignment
- execution status
- dates and progress
- blockers and corrective actions
- dependency placeholders

### 6. KPI Registry

- KPI list
- KPI detail
- baseline, target, actual
- thresholds and status
- ownership and source
- linked plan nodes

### 7. Monitoring And Evaluation

- cycle list
- cycle detail
- progress updates
- obstacles and corrective actions
- approval linkage

### 8. Mission Reporting

- report list
- report creation
- report detail
- draft and submission state
- completion indicator
- reviewer comments
- return for completion
- status history via comments and workflow

### 9. Training And Capacity Building

- program list
- program creation
- nomination flow
- manager review
- participation tracking
- certificate placeholder
- post-training and impact placeholders

### 10. Knowledge And Research

- searchable document list
- metadata and tags
- links to plans, reports, and training

### 11. Workflow And Approvals

- approval queue
- approve
- reject
- return with comment
- workflow-dependent status updates

### 12. Notifications And Alerts

- seeded alerts
- reminders
- approval notifications
- returned report alerts
- training deadline alerts

## Experience Flows Demonstrated

### Flow 1: Create A Dynamic Planning Template

1. Open `/templates/new`
2. Enter Arabic template metadata
3. Add ordered dynamic levels
4. Save the template

### Flow 2: Create A Plan From Template

1. Open `/plans/new`
2. Select a template
3. Provide period, owner, and unit
4. Create the plan
5. Open the plan detail page and begin building the hierarchy

### Flow 3: Review And Submit Plan For Approval

1. Edit plan nodes and ownership
2. Link relevant KPIs
3. Review progress and dates
4. Submit through the plan workflow

### Flow 4: Record Monitoring Progress

1. Open `/monitoring/[id]`
2. Submit a monitoring update
3. Record progress, obstacles, and corrective actions
4. Route the cycle into approval or review status

### Flow 5: Mission Report Return And Revision

1. Create or open a report in `/reports`
2. Submit the report
3. Reviewer returns it with comments
4. Mission user revises and resubmits

### Flow 6: Training Opportunity And Nomination

1. Create a training program in `/training/new`
2. User submits a nomination
3. Manager reviews and approves or rejects
4. Participation records appear on the program page

### Flow 7: Executive Review

1. Director General opens `/dashboard`
2. Reviews metrics, risks, approvals, and alerts
3. Navigates into plans, reports, and queue items
