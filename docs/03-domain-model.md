# 03 Domain Model

## Domain Overview

The domain model covers institutional planning, execution, reporting, training, approvals, and knowledge management. It is designed for future extensibility and avoids fixed planning assumptions.

## Core Reference Entities

### Role

Defines institutional roles such as:

- `مسؤول النظام`
- `مدير عام`
- `مدير إدارة`
- `محلل تخطيط`
- `مسؤول متابعة`
- `مسؤول تدريب`
- `مستخدم بعثة`
- `قارئ فقط`

### User

Represents platform users and stores:

- Arabic display name
- role
- organizational unit
- status
- ownership and workflow relationships

### OrganizationalUnit

Represents departments and missions, with support for hierarchy through `parentId`.

## Dynamic Planning Entities

### Template

Represents a planning blueprint. A template defines the institutional planning structure and can be reused across plans.

### TemplateLevel

Represents an ordered level inside a template, such as:

- Priority
- Strategic Goal
- Initiative
- Indicator

### TemplateField

Represents configurable fields attached to a level. Supported field types include:

- text
- long text
- number
- percent
- date
- select
- boolean
- user
- KPI
- status

### Plan

Represents an instantiated plan created from a template for a specific organizational context and period.

### PlanNode

Represents hierarchical nodes inside a plan. Each node references:

- a plan
- a template level
- an optional parent node
- optional owner
- progress and dates
- custom field values

### KPI And PlanNodeKPI

`KPI` stores the indicator registry, while `PlanNodeKPI` supports many-to-many linkage between plan nodes and indicators.

## Execution And Monitoring Entities

### Initiative

Represents execution items linked to plan nodes, including:

- ownership
- dates
- progress
- blockers
- corrective actions
- dependencies

### MonitoringCycle

Represents a follow-up period for a plan or unit.

### MonitoringUpdate

Represents submitted monitoring records tied to a cycle and optionally linked to:

- a plan node
- an initiative
- a KPI

## Reporting And Knowledge Entities

### MissionReport

Represents periodic mission submissions with:

- mission metadata
- reporting period
- narrative sections
- completion status
- review state

### MissionReportComment

Stores reviewer comments and return-for-completion notes.

### KnowledgeDocument

Represents reusable institutional documents with:

- metadata
- tags
- summary
- links to plans, reports, or training programs

## Training Entities

### TrainingProgram

Represents a training opportunity or institutional program.

### TrainingNomination

Represents employee nomination and manager decision flow.

### TrainingParticipation

Represents participation outcomes, certificates, and post-training reflections.

## Governance Entities

### ApprovalRequest

Provides a shared approval mechanism across:

- plans
- monitoring cycles
- mission reports
- training nominations
- templates

### Notification

Represents user-facing alerts and reminders.

### AuditLog

Stores institutional activity history for traceability and future compliance expansion.

## Status Design

The schema includes explicit enums for:

- user lifecycle
- template status
- plan and plan node status
- KPI health
- monitoring cycles and updates
- mission reports
- training programs and nominations
- approvals
- notifications

This improves readability, dashboard summarization, and future policy enforcement.
