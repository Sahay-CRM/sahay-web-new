Gantt API (base: /company/gantt)

Template

- POST /company/gantt/template/get

  - Payload: { currentPage?: number, pageSize?: number, ownerType?: "SYSTEM"|"COMPANY", industryId?: string, isActive?: boolean, isPublished?: boolean, search?: string }
  - Response: ApiPagingResponse { success: boolean, status: number, message: string, currentPage: number, totalCount: number, hasMore: boolean, pageSize: number, totalPage: number, sortBy?: string, sortOrder?: string, data: [ { ganttTemplateId: string, templateName: string, templateDescription?: string|null, ownerType: "SYSTEM"|"COMPANY", companyId?: string|null, industryId?: string|null, version: number, parentTemplateId?: string|null, isActive: boolean, isPublished: boolean, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string } ] }

- POST /company/gantt/template/get/:id

  - Params: id (ganttTemplateId)
  - Payload: none
  - Response: ApiResponse { success, status, message, data: { ganttTemplateId: string, templateName: string, templateDescription?: string|null, ownerType: "SYSTEM"|"COMPANY", companyId?: string|null, industryId?: string|null, version: number, parentTemplateId?: string|null, isActive: boolean, isPublished: boolean, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string, phases: [ { ganttTemplatePhaseId: string, ganttTemplateId: string, phaseName: string, phaseDescription?: string|null, phaseOrder: number, color?: string|null, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string, items: [ { ganttTemplateItemId: string, ganttTemplateId: string, ganttTemplatePhaseId?: string|null, parentItemId?: string|null, itemName: string, itemDescription?: string|null, itemType: "TASK"|"MILESTONE", relativeStartDay: number, relativeDurationDays: number, isMilestone: boolean, priority: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", itemOrder: number, color?: string|null, assigneeRoleHint?: string|null, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string } ] } ], dependencies: [ { ganttTemplateDependencyId: string, predecessorItemId: string, successorItemId: string, dependencyType: "FS"|"SS"|"FF"|"SF", lagDays: number } ], unphased: [ /* GanttTemplateItem objects (same shape as items) */ ] } }

- POST /company/gantt/template/create

  - Payload: { templateName: string, templateDescription?: string|null, ownerType: "SYSTEM"|"COMPANY", companyId?: string (required if ownerType=="COMPANY"), industryId?: string }
  - Response: ApiResponse { data: { ganttTemplateId: string, templateName: string, templateDescription?: string|null, ownerType: string, companyId?: string|null, industryId?: string|null, version: number, parentTemplateId?: string|null, isActive: boolean, isPublished: boolean, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string } }

- PUT /company/gantt/template/update/:id

  - Payload: { templateName?: string, templateDescription?: string|null, isActive?: boolean, industryId?: string }
  - Response: ApiResponse { data: { /_ template summary object same as create response _/ } }

- DELETE /company/gantt/template/delete/:id

  - Payload: none
  - Response: ApiResponse { data: null }

- POST /company/gantt/template/duplicate/:id

  - Payload: none
  - Response: ApiResponse { data: { ganttTemplateId: string, templateName: string } }

- POST /company/gantt/template/publish/:id
  - Payload: none
  - Response: ApiResponse { data: { /_ either template summary or new draft info: ganttTemplateId, version, isPublished _/ } }

Workspace

- POST /company/gantt/workspace/get

  - Payload: { currentPage?: number, pageSize?: number, workspaceStatus?: "DRAFT"|"ACTIVE"|"ON_HOLD"|"COMPLETED"|"CANCELLED", search?: string }
  - Response: ApiPagingResponse { success, status, message, currentPage, totalCount, hasMore, pageSize, totalPage, data: [ { ganttWorkspaceId: string, companyId: string, workspaceName: string, workspaceDescription?: string|null, sourceTemplateId?: string|null, startDate: string, targetEndDate?: string|null, actualEndDate?: string|null, workspaceStatus: string, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string } ] }

- POST /company/gantt/workspace/get/:id

  - Params: id (ganttWorkspaceId)
  - Payload: none
  - Response: ApiResponse { data: { workspace: { ganttWorkspaceId: string, companyId: string, workspaceName: string, workspaceDescription?: string|null, sourceTemplateId?: string|null, startDate: string, targetEndDate?: string|null, actualEndDate?: string|null, workspaceStatus: string, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string }, phases: [ { ganttPhaseId: string, ganttWorkspaceId: string, phaseName: string, phaseDescription?: string|null, phaseOrder: number, color?: string|null, sourceTemplatePhaseId?: string|null, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string } ], itemsTree: [ { /_ CompanyGanttItem with nested children _/ ganttItemId: string, ganttWorkspaceId: string, ganttPhaseId?: string|null, parentItemId?: string|null, itemName: string, itemDescription?: string|null, itemType: "TASK"|"MILESTONE", isMilestone: boolean, plannedStartDate?: string|null, plannedEndDate?: string|null, actualStartDate?: string|null, actualEndDate?: string|null, progressPercentage: number, itemStatus: string, priority: string, assignedToEmployeeId?: string|null, itemOrder: number, color?: string|null, sourceTemplateItemId?: string|null, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string, assignedEmployee?: { employeeId: string, employeeName: string, employeeEmail: string }, children?: [/* recursive */] } ], dependencies: [ { ganttDependencyId: string, predecessorItemId: string, successorItemId: string, dependencyType: "FS"|"SS"|"FF"|"SF", lagDays: number } ], metadata: { totalItems: number, completedItems: number, overallProgress: number } } }

- POST /company/gantt/workspace/create

  - Payload: { workspaceName: string, workspaceDescription?: string|null, startDate: string (ISO), targetEndDate?: string (ISO) }
  - Response: ApiResponse { data: { /_ company workspace object as above _/ } }

- POST /company/gantt/workspace/create-from-template

  - Payload: { templateId: string, workspaceName: string, workspaceDescription?: string|null, startDate: string (ISO), targetEndDate?: string (ISO) }
  - Response: ApiResponse { data: { ganttWorkspaceId: string, workspaceName: string, phasesCreated: number, itemsCreated: number, dependenciesCreated: number } }

- PUT /company/gantt/workspace/update/:id

  - Payload: { workspaceName?: string, workspaceDescription?: string|null, startDate?: string (ISO), targetEndDate?: string (ISO)|null, actualEndDate?: string (ISO)|null, workspaceStatus?: "DRAFT"|"ACTIVE"|"ON_HOLD"|"COMPLETED"|"CANCELLED" }
  - Response: ApiResponse { data: { /_ updated workspace object _/ } }

- DELETE /company/gantt/workspace/delete/:id
  - Payload: none
  - Response: ApiResponse { data: null }

Item

- POST /company/gantt/item/create

  - Payload: { ganttWorkspaceId: string, ganttPhaseId?: string|null, parentItemId?: string|null, itemName: string, itemDescription?: string|null, itemType?: "TASK"|"MILESTONE", isMilestone?: boolean, plannedStartDate?: string (ISO)|null, plannedEndDate?: string (ISO)|null, priority?: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", itemOrder?: number, color?: string|null, assignedToEmployeeId?: string|null }
  - Response: ApiResponse { data: { /_ CompanyGanttItem object: ganttItemId, ganttWorkspaceId, ganttPhaseId, parentItemId, itemName, itemDescription, itemType, isMilestone, plannedStartDate, plannedEndDate, actualStartDate, actualEndDate, progressPercentage, itemStatus, priority, assignedToEmployeeId, itemOrder, color, sourceTemplateItemId, createdBy, updatedBy, createdDatetime, updatedDatetime _/ } }

- PUT /company/gantt/item/update/:id

  - Payload: { itemName?: string, itemDescription?: string|null, itemType?: "TASK"|"MILESTONE", isMilestone?: boolean, priority?: "LOW"|"MEDIUM"|"HIGH"|"CRITICAL", color?: string|null, ganttPhaseId?: string|null }
  - Response: ApiResponse { data: { /_ updated CompanyGanttItem _/ } }

- DELETE /company/gantt/item/delete/:id

  - Payload: none
  - Response: ApiResponse { data: { archivedCount: number } }

- PUT /company/gantt/item/move/:id

  - Payload: { parentItemId?: string|null, ganttPhaseId?: string|null }
  - Response: ApiResponse { data: { /_ updated CompanyGanttItem _/ } }

- POST /company/gantt/item/reorder

  - Payload: { items: [ { ganttItemId: string, itemOrder: number } ] }
  - Response: ApiResponse { data: { updatedCount: number } }

- PUT /company/gantt/item/progress/:id

  - Payload: { progressPercentage: number (0-100), itemStatus?: "NOT_STARTED"|"IN_PROGRESS"|"ON_HOLD"|"COMPLETED"|"CANCELLED" }
  - Response: ApiResponse { data: { /_ updated CompanyGanttItem _/ } }

- PUT /company/gantt/item/dates/:id

  - Payload: { plannedStartDate?: string (ISO)|null, plannedEndDate?: string (ISO)|null, actualStartDate?: string (ISO)|null, actualEndDate?: string (ISO)|null }
  - Response: ApiResponse { data: { /_ updated CompanyGanttItem _/ } }

- PUT /company/gantt/item/assign/:id
  - Payload: { assignedToEmployeeId?: string|null }
  - Response: ApiResponse { data: { /_ updated CompanyGanttItem including assignedEmployee: { employeeId, employeeName, employeeEmail } _/ } }

Dependency

- POST /company/gantt/dependency/create

  - Payload: { ganttWorkspaceId: string, predecessorItemId: string, successorItemId: string, dependencyType?: "FS"|"SS"|"FF"|"SF", lagDays?: number }
  - Response: ApiResponse { data: { ganttDependencyId: string, ganttWorkspaceId: string, predecessorItemId: string, successorItemId: string, dependencyType: string, lagDays: number, createdBy: string, updatedBy?: string|null, createdDatetime: string, updatedDatetime: string } }

- DELETE /company/gantt/dependency/delete/:id

  - Payload: none
  - Response: ApiResponse { data: null }

- POST /company/gantt/dependency/get-by-workspace/:workspaceId
  - Params: workspaceId
  - Payload: none
  - Response: ApiSerialResponse { success: boolean, status: number, message: string, totalCount: number, data: [ { ganttDependencyId: string, predecessorItemId: string, successorItemId: string, dependencyType: string, lagDays: number, createdDatetime: string } ] }
