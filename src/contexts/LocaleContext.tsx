import React, { createContext, useContext, useState, useEffect } from "react";
import {no} from "zod/v4/locales";

type Locale = "en" | "pt-BR" | "es-ES";

interface LocaleContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const LocaleContext = createContext<LocaleContextType | undefined>(undefined);

const translations: Record<Locale, Record<string, string>> = {
  en: {
    // Navigation
    "nav.home": "Home",
    "nav.purchaseOrders": "Purchase Orders",
    "nav.credit": "Credit",
    "nav.users": "Users",
    "nav.notifications": "Notifications",
    "nav.brandName": "WDC Net",

    "common.confirm": "Confirm",
    "common.cancel": "Cancel",

    // Auth
    "auth.login": "Login",
    "auth.logout": "Logout",

    // Login
    "login.title": "Welcome Back",
    "login.subtitle": "Sign in to your account to continue",
    "login.signInMicrosoft": "Sign in with Microsoft",
    "login.orContinueWith": "Or continue with",
    "login.email": "Email",
    "login.emailPlaceholder": "Enter your email",
    "login.password": "Password",
    "login.passwordPlaceholder": "Enter your password",
    "login.signIn": "Sign In",
    "login.mfaTitle": "Two-Factor Authentication",
    "login.mfaSubtitle": "Enter the 6-digit code from your authenticator app",
    "login.verifying": "Verifying...",
    "login.verify": "Verify",
    "login.cancel": "Cancel",
    "login.success": "Login successful!",
    "login.mfaSuccess": "MFA verification successful!",
    "login.mfaError": "Invalid MFA code. Please try again.",
    "login.backToHome": "Back to Home",

    // Phone Verification
    "phoneVerification.title": "Welcome!",
    "phoneVerification.subtitle": "Let's verify your phone number",
    "phoneVerification.subtitleCode":
      "Enter the verification code sent to your WhatsApp",
    "phoneVerification.nameLabel": "Your Name",
    "phoneVerification.namePlaceholder": "Enter your name",
    "phoneVerification.phoneLabel": "WhatsApp Phone Number",
    "phoneVerification.phoneHelper":
      "Include country code (e.g., +1 for US, +55 for Brazil)",
    "phoneVerification.sendButton": "Send Verification Code",
    "phoneVerification.sending": "Sending...",
    "phoneVerification.codeSent": "Code sent to:",
    "phoneVerification.codeSentTitle": "Verification code sent",
    "phoneVerification.codeSentDesc":
      "Check your WhatsApp for the verification code",
    "phoneVerification.changePhone": "Change number",
    "phoneVerification.codeLabel": "Verification Code",
    "phoneVerification.codeValid": "Code valid for",
    "phoneVerification.verifyButton": "Verify Phone Number",
    "phoneVerification.verifying": "Verifying...",
    "phoneVerification.resendButton": "Resend Code",
    "phoneVerification.resendIn": "Resend available in",
    "phoneVerification.codeResentTitle": "Code resent",
    "phoneVerification.codeResentDesc": "Check your WhatsApp for a new code",
    "phoneVerification.success": "Phone verified successfully",
    "phoneVerification.successDesc":
      "You can now receive WhatsApp notifications",
    "phoneVerification.footer":
      "You'll receive important notifications about your purchase orders",
    "phoneVerification.error.unauthorized":
      "Session expired. Please log in again",
    "phoneVerification.error.invalidPhone":
      "Please enter a valid phone number (10-15 digits)",
    "phoneVerification.error.nameRequired": "Please enter your name",
    "phoneVerification.error.invalidCodeFormat": "Code must be 6 digits",
    "phoneVerification.error.codeExpired":
      "Code expired. Please request a new one",
    "phoneVerification.error.invalidCode": "Invalid code.",
    "phoneVerification.error.attemptsLeft": "attempts remaining",
    "phoneVerification.error.cooldown":
      "Please wait {seconds} seconds before resending",
    "phoneVerification.error.tooManyAttempts":
      "Too many attempts. Please request a new code",
    "phoneVerification.error.failedToSend":
      "Failed to send code. Please try again",
    "phoneVerification.error.generic": "An error occurred. Please try again",
    "phoneVerification.error.sendFailed": "Failed to send code",
    "phoneVerification.error.verifyFailed": "Verification failed",
    "phoneVerification.error.resendFailed": "Failed to resend code",

    // Dashboard
    "dashboard.title": "Purchase Orders",
    "dashboard.subtitle":
      "Manage and track all your purchase orders, drag the items to change their status.",
    "dashboard.viewKanban": "Kanban",
    "dashboard.viewTable": "Table",

    // Order Status
    "status.pending": "Pending",
    "status.approved": "Approved",
    "status.declined": "Declined",
    "status.changeStatus": "Change Status",

    // Order Card
    "order.client": "Client",
    "order.items": "items",
    "order.value": "Value",
    "order.dueDate": "Due",
    "order.statusUpdated": "Order status updated to",
    "order.approveSuccess": "Order approved successfully",
    "order.declineSuccess": "Order declined successfully",
    "order.revertSuccess": "Order reverted to pending successfully",
    "order.revertToPending": "Revert to Pending",
    "order.approve": "Approve",
    "order.decline": "Decline",
    "order.lockedTooltip":
      "This order is awaiting approval from a previous level",
    "order.waitingPreviousLevel": "Waiting Previous Level",

    // Order Details
    "orderDetail.title": "Purchase Order Details",
    "orderDetail.tabs.overview": "Overview",
    "orderDetail.tabs.saleOrder": "Sales Order",
    "orderDetail.tabs.products": "Products",
    "orderDetail.tabs.approvals": "Approvals",
    "orderDetail.tabs.costCenters": "Cost Centers",
    "orderDetail.supplierInfo": "Supplier Information",
    "orderDetail.supplierName": "Supplier Name",
    "orderDetail.clientInfo": "Client Information",
    "orderDetail.clientName": "Client Name",
    "orderDetail.email": "Email",
    "orderDetail.orderDetails": "Order Details",
    "orderDetail.description": "Description",
    "orderDetail.addresses": "Addresses",
    "orderDetail.billingAddress": "Billing Address",
    "orderDetail.shippingAddress": "Shipping Address",
    "orderDetail.orderNumber": "Order Number",
    "orderDetail.createdDate": "Created Date",
    "orderDetail.dueDate": "Due Date",
    "orderDetail.itemCount": "Item Count",
    "orderDetail.totalItems": "Total Items",
    "orderDetail.totalValue": "Total Value",
    "orderDetail.branch": "Branch",
    "orderDetail.branchCode": "Branch Code",
    "orderDetail.additionalInfo": "Additional Information",
    "orderDetail.buyer": "Buyer",
    "orderDetail.payment": "Payment Method",
    "orderDetail.noProducts": "No products found",
    "orderDetail.noApprovals": "No approval information available",
    "orderDetail.noCostCenters": "No cost centers found",
    "orderDetail.product.item": "Item",
    "orderDetail.product.description": "Description",
    "orderDetail.product.partNumber": "Part #",
    "orderDetail.product.unit": "Unit",
    "orderDetail.product.quantity": "Qty",
    "orderDetail.product.unitPrice": "Unit Price",
    "orderDetail.product.total": "Total",
    "orderDetail.product.costCenter": "Cost Center",
    "orderDetail.approval.level": "Level",
    "orderDetail.costCenter.code": "Code",
    "orderDetail.costCenter.totalValue": "Total Value",
    "orderDetail.costCenter.percentage": "Percentage",

    // Welcome Page
    "welcome.greeting": "Welcome back",
    "welcome.todayOverview": "Today's Overview",
    "welcome.todayStats": "Today's Statistics",
    "welcome.notifications": "Notifications",
    "welcome.pendingApprovals": "Pending Approvals",
    "welcome.urgentOrders": "Urgent Orders",
    "welcome.urgentItems": "Urgent Items",
    "welcome.totalValue": "Total Value",
    "welcome.needsApproval": "Needs Approval",
    "welcome.recentActivity": "Recent Activity",
    "welcome.viewAll": "View All Orders",
    "welcome.viewAllOrders": "View All Orders",
    "welcome.viewAllCredits": "View All Credits",
    "welcome.purchaseOrders": "Purchase Orders",
    "welcome.creditRequests": "Credit Requests",
    "welcome.noPendingOrders": "No orders pending approval",
    "welcome.noPendingItems": "No pending items",
    "welcome.allCaughtUp": "Great job! You're all caught up.",

    // Admin Dashboard
    "admin.title": "Admin Dashboard",
    "admin.description": "Manage users, departments, roles, and positions",
    "admin.users": "Users",
    "admin.departments": "Departments",
    "admin.roles": "Roles",
    "admin.positions": "Positions",
    "admin.noPermission":
      "You don't have permission to access the admin dashboard.",

    // Departments
    "department.title": "Departments",
    "department.create": "Create Department",
    "department.edit": "Edit Department",
    "department.delete": "Delete Department",
    "department.name": "Department Name",

    // Roles
    "role.title": "Roles",
    "role.create": "Create Role",
    "role.edit": "Edit Role",
    "role.delete": "Delete Role",
    "role.name": "Role Name",
    "role.accessLevel": "Access Level",

    // Positions
    "position.title": "Positions",
    "position.create": "Create Position",
    "position.edit": "Edit Position",
    "position.delete": "Delete Position",
    "position.name": "Position Name",
    "position.description": "Description",
    "position.role": "Role",
    "position.department": "Department",

    // Users
    "user.name": "Name",
    "user.email": "Email",
    "user.phone": "Phone",
    "user.position": "Position",
    "user.department": "Department",
    "user.role": "Role",
    "user.firstAccess": "First Access",
    "user.selectPosition": "Select a position",
    "user.noPosition": "No position assigned",
    "user.totalUsers": "Total Users",
    "user.searchUsers": "Search users...",
    "user.addUser": "Add User",

    // Navigation
    "nav.admin": "Admin",

    // Profile
    "profile.role": "Purchase Manager",
    "profile.department": "Department",
    "profile.loadingProfile": "Loading profile...",
    "profile.errorLoading": "Unable to load profile details",
    "profile.notSpecified": "Not specified",

    // Pagination
    "pagination.itemsPerPage": "Items per page:",

    // Actions
    "actions.approve": "Approve",
    "actions.decline": "Decline",
    "actions.viewDetails": "View Details",
    "actions.approving": "Approving...",
    "actions.declining": "Declining...",

    // Filters
    "filters.filters": "Filters",
    "filters.search": "Search",
    "filters.apply": "Apply",
    "filters.clear": "Clear Filters",
    "filters.searchPlaceholder": "Search by order number or supplier",
    "filters.status": "Status",
    "filters.allStatuses": "All Statuses",
    "filters.branch": "Branch",
    "filters.branchAll": "All Branches",
    "filters.dateFrom": "Date from",
    "filters.dateTo": "Date to",
    "filters.selectDate": "Select Date",

    // Order
    "order.branch": "Branch",
    "order.filterByBranch": "Filter by branch",
    "order.allBranches": "All Branches",

    // Table
    "table.orderID": "Order ID",
    "table.orderNumber": "Order #",
    "table.supplier": "Supplier",
    "table.branch": "Branch",
    "table.client": "Client",
    "table.status": "Status",
    "table.value": "Value",
    "table.items": "Items",
    "table.dueDate": "Due Date",
    "table.actions": "Actions",

    // Common
    "common.urgent": "Urgent",
    "common.yes": "Yes",
    "common.no": "No",
    "common.all": "All",
    "common.hideFilters": "Hide Filters",

    // Kanban
    "kanban.noOrders": "No orders",
    kanbanView: "Kanban View",
    tableView: "Table View",

    // Filters
    filters: "Filters",
    clearFilters: "Clean filters",
    search: "Search",
    status: "Status",
    allStatuses: "All Statuses",
    startDate: "Initial Date",
    endDate: "Final Data",

    // Credit
    "credit.title": "Credit Management",
    "credit.subtitle": "Manage and track credit flow elements",
    "credit.offer": "Offer",
    "credit.client": "Client",
    "credit.linkedClients": "Linked Clients",
    "credit.value": "Value",
    "credit.currency": "Currency",
    "credit.seller": "Seller",
    "credit.paymentConditions": "Payment Conditions",
    "credit.type": "Type",
    "credit.group": "Group",
    "credit.user": "User",
    "credit.isSN": "Simples Nacional",
    "credit.dueDate": "Due Date",
    "credit.limit": "Limit",
    "credit.secondaryLimit": "Secondary Limit",
    "credit.firstPurchase": "First Purchase",
    "credit.biggestPurchase": "Biggest Purchase",
    "credit.noCredits": "No credit elements found",
    "credit.noCreditsInStatus": "No items in this status",
    "credit.noLinkedClients": "No linked clients",
    "credit.searchPlaceholder": "Search by offer, client, or key",
    "credit.dateRange": "Date Range",
    "credit.valueRange": "Value Range",
    "credit.filterByType": "Filter by Type",
    "credit.selectType": "Select type",
    "credit.allTypes": "All Types",
    "credit.filterByFinancial": "Filter by Financial Status",
    "credit.selectFinancial": "Select financial status",
    "credit.allFinancials": "All Financial Statuses",
    "credit.filterByOperation": "Filter by Operation",
    "credit.selectOperation": "Select operation",
    "credit.allOperations": "All Operations",
    "credit.overview": "Overview",
    "credit.documents": "Documents",
    "credit.salesOrder": "Sales Order",
    "credit.clientInfo": "Client Info",
    "credit.elementInfo": "Proposal information",
    "credit.salesOrderDetails": "Sales Order Details",
    "credit.branch": "Branch",
    "credit.store": "Store",
    "credit.id": "Id",
    "credit.assignTo": "Assign item to ...",
    "credit.foundation": "Foundation Date",
    "credit.lastPurchase": "Last Purchase",
    "credit.justifyStatusChange": "Justify Status Change",
    "credit.justifyStatusChangeDescription":
      "Please explain why you are moving this credit to",
    "credit.justification": "Justification",
    "credit.justificationPlaceholder": "Enter your reason (max 50 characters)",
    "credit.emissionDate": "Emission Date",
    "credit.shippingType": "Shipping Type",
    "credit.shippingCost": "Shipping Cost",
    "credit.message": "Message",
    "credit.salesDocuments": "Sales Documents",
    "credit.quoteDocuments": "Quote Documents",
    "credit.clientDocuments": "Client Documents",
    "credit.noDocuments": "No documents found",
    "credit.docTitle": "Title",
    "credit.docDescription": "Description",
    "credit.clientDetails": "Client Details",
    "credit.clientName": "Name",
    "credit.cgc": "CGC",
    "credit.cpfCnpj": "CPF/CNPJ",
    "credit.address": "Address",
    "credit.risk": "Risk",
    "credit.lc": "Credit Limit",
    "credit.linkedClientsInfo": "Linked Clients Information",
    "credit.financialHistory": "Financial History",
    "credit.number": "Number",
    "credit.emission": "Emission",
    "credit.expiration": "Expiration",
    "credit.noClientInfo": "No client information available",
    "credit.filterByStatus": "Filter by Status",
    "credit.clearFilters": "Clear Filters",
    "credit.totalValue": "Total Value",
    "credit.totalBalance": "Open Balance",
    "credit.outstandingAmount": "Outstanding amount",
    "credit.item": "item",
    "credit.items": "items",
    "credit.status": "Status",
    "credit.document": "Document",
    "credit.realDueDate": "Real Due Date",
    "credit.lastPayment": "Payment",
    "credit.balance": "Balance",
    "credit.noFinancialRecords": "No financial history records found",
    "credit.showingItems": "Showing",
    "credit.toItems": "to",
    "credit.ofItems": "of",
    "credit.activityLogs": "Activity Logs",
    "credit.noLogs": "No activity logs found",
    "credit.activityLogsDescription": "View activity logs for this element",
    "credit.viewLogs": "View Logs",

    // Credit Assignment Dialog
    "credit.assign.title": "Assign Credit Item",
    "credit.assign.description":
      "Assign this credit item to another user by entering their email address.",
    "credit.assign.currentAssignee": "Current Assignee",
    "credit.assign.unassigned": "Unassigned",
    "credit.assign.emailLabel": "Assignee Email *",
    "credit.assign.emailPlaceholder": "user@example.com",
    "credit.assign.submit": "Assign",
    "credit.assign.self": "Assign to me",
    "credit.assign.toSelf": "Assigned to me",
    "credit.assign.selfSuccessDesc": "Successfully assigned to you.",
    "credit.assign.selfPermissionDeniedDesc":
      "You can only assign unassigned items to yourself.",
    "credit.assign.emailRequiredTitle": "Email required",
    "credit.assign.emailRequiredDesc": "Please enter an email address.",
    "credit.assign.invalidEmailTitle": "Invalid email",
    "credit.assign.invalidEmailDesc": "Please enter a valid email address.",
    "credit.assign.successTitle": "Item assigned",
    "credit.assign.successDesc": "Successfully assigned to {email}",
    "credit.assign.permissionDeniedTitle": "Permission denied",
    "credit.assign.permissionDeniedDesc":
      "You don't have permission to assign this item to another user.",
    "credit.assign.failedTitle": "Assignment failed",
    "credit.assign.notFoundOrInvalid": "Item not found or invalid data.",
    "credit.assign.genericError": "Could not assign item. Please try again.",

    // Home Page
    "home.pending": "Pending",
    "home.urgent": "Urgent",
    "home.value": "Total Value",

    // Users Management
    "users.title": "Users Management",
    "users.description": "Manage user accounts and permissions",
    "users.createUser": "Create User",
    "users.editUser": "Edit User",
    "users.deleteUser": "Delete User",
    "users.searchPlaceholder": "Search users...",
    "users.noUsers": "No users found",
    "users.name": "Name",
    "users.email": "Email",
    "users.department": "Department",
    "users.position": "Position",
    "users.role": "Role",
    "users.actions": "Actions",
    "users.created": "User created successfully",
    "users.updated": "User updated successfully",
    "users.deleted": "User deleted successfully",
    "users.createError": "Failed to create user",
    "users.updateError": "Failed to update user",
    "users.deleteError": "Failed to delete user",
    "users.deleteConfirm": "Are you sure you want to delete this user?",
    "users.permissionDenied": "You don't have permission to access this page",
  },
  "pt-BR": {
    // Navigation
    "nav.home": "Início",
    "nav.purchaseOrders": "Pedidos de Compra",
    "nav.credit": "Crédito",
    "nav.users": "Usuários",
    "nav.notifications": "Notificações",
    "nav.brandName": "WDC Net",

    // Auth
    "auth.login": "Entrar",
    "auth.logout": "Sair",

    // Login
    "login.title": "Bem-vindo de Volta",
    "login.subtitle": "Entre na sua conta para continuar",
    "login.signInMicrosoft": "Entrar com Microsoft",
    "login.orContinueWith": "Ou continue com",
    "login.email": "E-mail",
    "login.emailPlaceholder": "Digite seu e-mail",
    "login.password": "Senha",
    "login.passwordPlaceholder": "Digite sua senha",
    "login.signIn": "Entrar",
    "login.mfaTitle": "Autenticação de Dois Fatores",
    "login.mfaSubtitle":
      "Digite o código de 6 dígitos do seu aplicativo autenticador",
    "login.verifying": "Verificando...",
    "login.verify": "Verificar",
    "login.cancel": "Cancelar",
    "login.success": "Login realizado com sucesso!",
    "login.mfaSuccess": "Verificação MFA bem-sucedida!",
    "login.mfaError": "Código MFA inválido. Tente novamente.",
    "login.backToHome": "Voltar ao Início",

    // Phone Verification
    "phoneVerification.title": "Bem-vindo!",
    "phoneVerification.subtitle": "Vamos verificar seu número de telefone",
    "phoneVerification.subtitleCode":
      "Digite o código de verificação enviado para seu WhatsApp",
    "phoneVerification.nameLabel": "Seu Nome",
    "phoneVerification.namePlaceholder": "Digite seu nome",
    "phoneVerification.phoneLabel": "Número do WhatsApp",
    "phoneVerification.phoneHelper":
      "Inclua o código do país (ex: +55 para Brasil)",
    "phoneVerification.sendButton": "Enviar Código de Verificação",
    "phoneVerification.sending": "Enviando...",
    "phoneVerification.codeSent": "Código enviado para:",
    "phoneVerification.codeSentTitle": "Código de verificação enviado",
    "phoneVerification.codeSentDesc":
      "Verifique seu WhatsApp para o código de verificação",
    "phoneVerification.changePhone": "Alterar número",
    "phoneVerification.codeLabel": "Código de Verificação",
    "phoneVerification.codeValid": "Código válido por",
    "phoneVerification.verifyButton": "Verificar Número de Telefone",
    "phoneVerification.verifying": "Verificando...",
    "phoneVerification.resendButton": "Reenviar Código",
    "phoneVerification.resendIn": "Reenviar disponível em",
    "phoneVerification.codeResentTitle": "Código reenviado",
    "phoneVerification.codeResentDesc":
      "Verifique seu WhatsApp para um novo código",
    "phoneVerification.success": "Telefone verificado com sucesso",
    "phoneVerification.successDesc":
      "Agora você pode receber notificações do WhatsApp",
    "phoneVerification.footer":
      "Você receberá notificações importantes sobre seus pedidos de compra",
    "phoneVerification.error.unauthorized":
      "Sessão expirada. Por favor, faça login novamente",
    "phoneVerification.error.invalidPhone":
      "Por favor, insira um número de telefone válido (10-15 dígitos)",
    "phoneVerification.error.nameRequired": "Por favor, insira seu nome",
    "phoneVerification.error.invalidCodeFormat": "O código deve ter 6 dígitos",
    "phoneVerification.error.codeExpired":
      "Código expirado. Por favor, solicite um novo",
    "phoneVerification.error.invalidCode": "Código inválido.",
    "phoneVerification.error.attemptsLeft": "tentativas restantes",
    "phoneVerification.error.cooldown":
      "Por favor, aguarde {seconds} segundos antes de reenviar",
    "phoneVerification.error.tooManyAttempts":
      "Muitas tentativas. Por favor, solicite um novo código",
    "phoneVerification.error.failedToSend":
      "Falha ao enviar código. Por favor, tente novamente",
    "phoneVerification.error.generic":
      "Ocorreu um erro. Por favor, tente novamente",
    "phoneVerification.error.sendFailed": "Falha ao enviar código",
    "phoneVerification.error.verifyFailed": "Falha na verificação",
    "phoneVerification.error.resendFailed": "Falha ao reenviar código",

    // Dashboard
    "dashboard.title": "Pedidos de Compra",
    "dashboard.subtitle":
      "Gerencie e acompanhe todas os seus Pedidos de compra, arraste os itens para alterar o status.",
    "dashboard.viewKanban": "Kanban",
    "dashboard.viewTable": "Tabela",

    // Order Status
    "status.pending": "Pendente",
    "status.approved": "Aprovado",
    "status.declined": "Recusado",
    "status.changeStatus": "Alterar Status",

    // Order Card
    "order.client": "Cliente",
    "order.items": "itens",
    "order.value": "Valor",
    "order.dueDate": "Criação",
    "order.approveSuccess": "Pedido aprovado com sucesso",
    "order.declineSuccess": "Pedido recusado com sucesso",
    "order.statusUpdated": "Status do Pedido atualizado para",
    "order.revertSuccess": "Pedido revertido para pendente com sucesso",
    "order.revertToPending": "Reverter para Pendente",
    "order.approve": "Aprovar",
    "order.decline": "Recusar",
    "order.lockedTooltip":
      "Este pedido está aguardando aprovação de um nível anterior",
    "order.waitingPreviousLevel": "Aguardando Nível Anterior",

    // Order Details
    "orderDetail.title": "Detalhes do Pedido de Compra",
    "orderDetail.tabs.overview": "Visão Geral",
    "orderDetails.tabs.saleOrder": "Pedido de Venda",
    "orderDetail.tabs.products": "Produtos",
    "orderDetail.tabs.approvals": "Aprovações",
    "orderDetail.tabs.costCenters": "Centros de Custo",
    "orderDetail.supplierInfo": "Informações do Fornecedor",
    "orderDetail.supplierName": "Nome do Fornecedor",
    "orderDetail.clientInfo": "Informações do Cliente",
    "orderDetail.clientName": "Nome do Cliente",
    "orderDetail.email": "E-mail",
    "orderDetail.orderDetails": "Detalhes do Pedido",
    "orderDetail.description": "Descrição",
    "orderDetail.addresses": "Endereços",
    "orderDetail.billingAddress": "Endereço de Cobrança",
    "orderDetail.shippingAddress": "Endereço de Entrega",
    "orderDetail.orderNumber": "Número do Pedido",
    "orderDetail.createdDate": "Data de Criação",
    "orderDetail.dueDate": "Data de Vencimento",
    "orderDetail.itemCount": "Quantidade de Itens",
    "orderDetail.totalItems": "Total de Itens",
    "orderDetail.totalValue": "Valor Total",
    "orderDetail.branch": "Filial",
    "orderDetail.branchCode": "Código da Filial",
    "orderDetail.additionalInfo": "Informações Adicionais",
    "orderDetail.buyer": "Comprador",
    "orderDetail.payment": "Forma de Pagamento",
    "orderDetail.noProducts": "Nenhum produto encontrado",
    "orderDetail.noApprovals": "Nenhuma informação de aprovação disponível",
    "orderDetail.noCostCenters": "Nenhum centro de custo encontrado",
    "orderDetail.product.item": "Item",
    "orderDetail.product.description": "Descrição",
    "orderDetail.product.partNumber": "Part #",
    "orderDetail.product.unit": "Unidade",
    "orderDetail.product.quantity": "Qtd",
    "orderDetail.product.unitPrice": "Preço Unit.",
    "orderDetail.product.total": "Total",
    "orderDetail.product.costCenter": "Centro de Custo",
    "orderDetail.approval.level": "Nível",
    "orderDetail.costCenter.code": "Código",
    "orderDetail.costCenter.totalValue": "Valor Total",
    "orderDetail.costCenter.percentage": "Porcentagem",

    // Welcome Page
    "welcome.greeting": "Bem-vindo de volta",
    "welcome.todayOverview": "Visão Geral de Hoje",
    "welcome.todayStats": "Estatísticas de Hoje",
    "welcome.notifications": "Notificações",
    "welcome.pendingApprovals": "Aprovações Pendentes",
    "welcome.urgentOrders": "Pedidos Urgentes",
    "welcome.urgentItems": "Itens Urgentes",
    "welcome.totalValue": "Valor Total",
    "welcome.needsApproval": "Precisa de Aprovação",
    "welcome.recentActivity": "Atividade Recente",
    "welcome.viewAll": "Ver Todas os Pedidos",
    "welcome.viewAllOrders": "Ver Todos os Pedidos",
    "welcome.viewAllCredits": "Ver Todos os Créditos",
    "welcome.purchaseOrders": "Pedidos de Compra",
    "welcome.creditRequests": "Solicitações de Crédito",
    "welcome.noPendingOrders": "Nenhum pedido pendente de aprovação",
    "welcome.noPendingItems": "Nenhum item pendente",
    "welcome.allCaughtUp": "Ótimo trabalho! Você está em dia.",

    // Admin Dashboard
    "admin.title": "Painel Administrativo",
    "admin.description": "Gerenciar usuários, departamentos, funções e cargos",
    "admin.users": "Usuários",
    "admin.departments": "Departamentos",
    "admin.roles": "Funções",
    "admin.positions": "Cargos",
    "admin.noPermission":
      "Você não tem permissão para acessar o painel administrativo.",

    // Departments
    "department.title": "Departamentos",
    "department.create": "Criar Departamento",
    "department.edit": "Editar Departamento",
    "department.delete": "Excluir Departamento",
    "department.name": "Nome do Departamento",

    // Roles
    "role.title": "Funções",
    "role.create": "Criar Função",
    "role.edit": "Editar Função",
    "role.delete": "Excluir Função",
    "role.name": "Nome da Função",
    "role.accessLevel": "Nível de Acesso",

    // Positions
    "position.title": "Cargos",
    "position.create": "Criar Cargo",
    "position.edit": "Editar Cargo",
    "position.delete": "Excluir Cargo",
    "position.name": "Nome do Cargo",
    "position.description": "Descrição",
    "position.role": "Função",
    "position.department": "Departamento",

    // Users
    "user.name": "Nome",
    "user.email": "Email",
    "user.phone": "Telefone",
    "user.position": "Cargo",
    "user.department": "Departamento",
    "user.role": "Função",
    "user.firstAccess": "Primeiro Acesso",
    "user.selectPosition": "Selecione um cargo",
    "user.noPosition": "Nenhum cargo atribuído",
    "user.totalUsers": "Total de Usuários",
    "user.searchUsers": "Pesquisar usuários...",
    "user.addUser": "Adicionar Usuário",

    // Navigation
    "nav.admin": "Admin",

    // Profile
    "profile.role": "Gerente de Compras",
    "profile.department": "Departamento",
    "profile.loadingProfile": "Carregando perfil...",
    "profile.errorLoading": "Não foi possível carregar os detalhes do perfil",
    "profile.notSpecified": "Não especificado",

    // Pagination
    "pagination.itemsPerPage": "Itens por página:",

    // Actions
    "actions.approve": "Aprovar",
    "actions.decline": "Recusar",
    "actions.viewDetails": "Ver Detalhes",
    "actions.approving": "Aprovando...",
    "actions.declining": "Recusando...",

    // Filters
    "filters.filters": "Filtros",
    "filters.search": "Pesquisar",
    "filters.apply": "Aplicar",
    "filters.clear": "Limpar",
    "filters.searchPlaceholder": "Pesquisa por número do pedido ou fornecedor",
    "filters.status": "Status",
    "filters.allStatuses": "Todos os Status",
    "filters.branch": "Filial",
    "filters.branchAll": "Todas as Filiais",
    "filters.dateFrom": "Data a partir",
    "filters.dateTo": "Data até",
    "filters.selectDate": "Selecionar Data",

    // Order
    "order.branch": "Filial",
    "order.filterByBranch": "Filtrar por filial",
    "order.allBranches": "Todas as Filiais",

    // Table
    "table.orderID": "ID do Pedido",
    "table.orderNumber": "Pedido Nº",
    "table.supplier": "Fornecedor",
    "table.branch": "Filial",
    "table.client": "Cliente",
    "table.status": "Status",
    "table.value": "Valor",
    "table.items": "Itens",
    "table.dueDate": "Vencimento",
    "table.creationDate": "Data de criação",
    "table.actions": "Ações",

    // Common
    "common.urgent": "Urgente",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.yes": "Sim",
    "common.no": "Não",
    "common.all": "Todos",
    "common.hideFilters": "Ocultar Filtros",

    // Kanban
    "kanban.noOrders": "Nenhum pedido",
    kanbanView: "Visualização Kanban",
    tableView: "Visualização em Tabela",

    // Credit
    "credit.title": "Gestão de Crédito",
    "credit.subtitle": "Gerencie e acompanhe elementos de fluxo de crédito",
    "credit.offer": "Proposta",
    "credit.client": "Cliente",
    "credit.linkedClients": "Clientes Vinculados",
    "credit.value": "Valor",
    "credit.currency": "Moeda",
    "credit.seller": "Vendedor",
    "credit.paymentConditions": "Condições de Pagamento",
    "credit.type": "Tipo",
    "credit.isSN": "Simples Nacional",
    "credit.dueDate": "Vencimento",
    "credit.limit": "Limite",
    "credit.secondaryLimit": "Limite Secundário",
    "credit.firstPurchase": "Primeira Compra",
    "credit.biggestPurchase": "Maior Compra",
    "credit.group": "Grupo",
    "credit.user": "Usuário",
    "credit.noCredits": "Nenhum elemento de crédito encontrado",
    "credit.noCreditsInStatus": "Nenhum item neste status",
    "credit.noLinkedClients": "Nenhum cliente vinculado",
    "credit.searchPlaceholder": "Pesquisar por proposta, cliente ou chave",
    "credit.dateRange": "Período",
    "credit.valueRange": "Faixa de Valor",
    "credit.filterByType": "Filtrar por Tipo",
    "credit.selectType": "Selecione o tipo",
    "credit.allTypes": "Todos os Tipos",
    "credit.filterByFinancial": "Filtrar por Financeira",
    "credit.selectFinancial": "Selecione a financeira",
    "credit.allFinancials": "Todas as Financeiras",
    "credit.filterByOperation": "Filtrar por Operação",
    "credit.selectOperation": "Selecione a operação",
    "credit.allOperations": "Todas as Operações",
    "credit.overview": "Visão Geral",
    "credit.documents": "Documentos",
    "credit.foundation": "Data de Fundação",
    "credit.lastPurchase": "Ultima compra",
    "credit.clientInfo": "Info do Cliente",
    "credit.elementInfo": "Informações da Proposta",
    "credit.salesOrderDetails": "Detalhes do Pedido de Venda",
    "credit.branch": "Filial",
    "credit.emissionDate": "Data de Emissão",
    "credit.shippingType": "Tipo de Frete",
    "credit.shippingCost": "Custo de Frete",
    "credit.message": "Mensagem",
    "credit.salesOrder": "Pedido de Venda",
    "credit.salesDocuments": "Documentos de Venda",
    "credit.quoteDocuments": "Documentos de Cotação",
    "credit.clientDocuments": "Documentos do Cliente",
    "credit.noDocuments": "Nenhum documento encontrado",
    "credit.docTitle": "Título",
    "credit.docDescription": "Descrição",
    "credit.clientDetails": "Detalhes do Cliente",
    "credit.clientName": "Nome",
    "credit.cgc": "CGC",
    "credit.cpfCnpj": "CPF/CNPJ",
    "credit.address": "Endereço",
    "credit.risk": "Risco",
    "credit.lc": "Limite de Crédito",
    "credit.linkedClientsInfo": "Informação dos Clientes Vinculados",
    "credit.financialHistory": "Histórico Financeiro",
    "credit.number": "Número",
    "credit.emission": "Emissão",
    "credit.expiration": "Vencimento",
    "credit.noClientInfo": "Nenhuma informação do cliente disponível",
    "credit.filterByStatus": "Filtrar por Status",
    "credit.clearFilters": "Limpar Filtros",
    "credit.totalValue": "Valor Total",
    "credit.totalBalance": "Saldo em Aberto",
    "credit.outstandingAmount": "Valor pendente",
    "credit.item": "item",
    "credit.assignTo": "Atribuir item a ...",
    "credit.store": "Loja",
    "credit.id": "Código",
    "credit.justifyStatusChange": "Justificar Mudança de Status",
    "credit.justifyStatusChangeDescription":
      "Por favor, explique por que você está movendo este crédito para",
    "credit.justification": "Justificativa",
    "credit.justificationPlaceholder": "Digite sua razão (máx 50 caracteres)",
    "credit.items": "itens",
    "credit.status": "Status",
    "credit.document": "Documento",
    "credit.realDueDate": "Vencimento Real",
    "credit.lastPayment": "Pagamento",
    "credit.balance": "Saldo",
    "credit.noFinancialRecords": "Nenhum registro financeiro encontrado",
    "credit.showingItems": "Mostrando",
    "credit.toItems": "até",
    "credit.ofItems": "de",
    "credit.activityLogs": "Registros de Atividade",
    "credit.noLogs": "Nenhum registro de atividade encontrado",
    "credit.activityLogsDescription":
      "Veja os registros de atividade deste item",
    "credit.viewLogs": "Ver Registros",

    // Credit Assignment Dialog
    "credit.assign.title": "Atribuir Item de Crédito",
    "credit.assign.description":
      "Atribua este item de crédito a outro usuário informando o e-mail dele.",
    "credit.assign.currentAssignee": "Responsável Atual",
    "credit.assign.unassigned": "Sem responsável",
    "credit.assign.emailLabel": "E-mail do Responsável *",
    "credit.assign.emailPlaceholder": "usuario@exemplo.com",
    "credit.assign.submit": "Atribuir",
    "credit.assign.self": "Atribuir a mim",
    "credit.assign.toSelf": "Atribuidos a mim",
    "credit.assign.selfSuccessDesc": "Atribuído com sucesso para você.",
    "credit.assign.selfPermissionDeniedDesc":
      "Você só pode atribuir a si mesmo itens sem responsável.",
    "credit.assign.emailRequiredTitle": "E-mail obrigatório",
    "credit.assign.emailRequiredDesc":
      "Por favor, insira um endereço de e-mail.",
    "credit.assign.invalidEmailTitle": "E-mail inválido",
    "credit.assign.invalidEmailDesc":
      "Por favor, insira um endereço de e-mail válido.",
    "credit.assign.successTitle": "Item atribuído",
    "credit.assign.successDesc": "Atribuído com sucesso para {email}",
    "credit.assign.permissionDeniedTitle": "Permissão negada",
    "credit.assign.permissionDeniedDesc":
      "Você não tem permissão para atribuir este item a outro usuário.",
    "credit.assign.failedTitle": "Falha na atribuição",
    "credit.assign.notFoundOrInvalid":
      "Item não encontrado ou dados inválidos.",
    "credit.assign.genericError":
      "Não foi possível atribuir o item. Tente novamente.",

    // Home Page
    "home.pending": "Pendente",
    "home.urgent": "Urgente",
    "home.value": "Valor Total",

    // Filters
    filters: "Filtros",
    clearFilters: "Limpar Filtros",
    search: "Pesquisar",
    status: "Status",
    allStatuses: "Todos os Status",
    startDate: "Data Inicial",
    endDate: "Data Final",

    // Users Management
    "users.title": "Gerenciamento de Usuários",
    "users.description": "Gerencie contas e permissões de usuários",
    "users.createUser": "Criar Usuário",
    "users.editUser": "Editar Usuário",
    "users.deleteUser": "Excluir Usuário",
    "users.searchPlaceholder": "Buscar usuários...",
    "users.noUsers": "Nenhum usuário encontrado",
    "users.name": "Nome",
    "users.email": "E-mail",
    "users.department": "Departamento",
    "users.position": "Cargo",
    "users.role": "Função",
    "users.actions": "Ações",
    "users.created": "Usuário criado com sucesso",
    "users.updated": "Usuário atualizado com sucesso",
    "users.deleted": "Usuário excluído com sucesso",
    "users.createError": "Falha ao criar usuário",
    "users.updateError": "Falha ao atualizar usuário",
    "users.deleteError": "Falha ao excluir usuário",
    "users.deleteConfirm": "Tem certeza que deseja excluir este usuário?",
    "users.permissionDenied": "Você não tem permissão para acessar esta página",
  },
  "es-ES": {
    // Navigation
    "nav.home": "Inicio",
    "nav.purchaseOrders": "Órdenes de Compra",
    "nav.credit": "Crédito",
    "nav.users": "Usuarios",
    "nav.notifications": "Notificaciones",
    "nav.brandName": "WDC Net",

    // Auth
    "auth.login": "Iniciar Sesión",
    "auth.logout": "Cerrar Sesión",

    // Login
    "login.title": "Bienvenido de Nuevo",
    "login.subtitle": "Inicia sesión en tu cuenta para continuar",
    "login.signInMicrosoft": "Iniciar sesión con Microsoft",
    "login.orContinueWith": "O continúa con",
    "login.email": "Correo Electrónico",
    "login.emailPlaceholder": "Ingresa tu correo electrónico",
    "login.password": "Contraseña",
    "login.passwordPlaceholder": "Ingresa tu contraseña",
    "login.signIn": "Iniciar Sesión",
    "login.mfaTitle": "Autenticación de Dos Factores",
    "login.mfaSubtitle":
      "Ingresa el código de 6 dígitos de tu aplicación de autenticación",
    "login.verifying": "Verificando...",
    "login.verify": "Verificar",
    "login.cancel": "Cancelar",
    "login.success": "¡Inicio de sesión exitoso!",
    "login.mfaSuccess": "¡Verificación MFA exitosa!",
    "login.mfaError": "Código MFA inválido. Por favor, inténtalo de nuevo.",
    "login.backToHome": "Volver al Inicio",

    // Phone Verification
    "phoneVerification.title": "¡Bienvenido!",
    "phoneVerification.subtitle": "Vamos a verificar tu número de teléfono",
    "phoneVerification.subtitleCode":
      "Ingresa el código de verificación enviado a tu WhatsApp",
    "phoneVerification.nameLabel": "Tu Nombre",
    "phoneVerification.namePlaceholder": "Ingresa tu nombre",
    "phoneVerification.phoneLabel": "Número de WhatsApp",
    "phoneVerification.phoneHelper":
      "Incluye el código de país (ej: +1 para EE.UU., +55 para Brasil)",
    "phoneVerification.sendButton": "Enviar Código de Verificación",
    "phoneVerification.sending": "Enviando...",
    "phoneVerification.codeSent": "Código enviado a:",
    "phoneVerification.codeSentTitle": "Código de verificación enviado",
    "phoneVerification.codeSentDesc":
      "Revisa tu WhatsApp para el código de verificación",
    "phoneVerification.changePhone": "Cambiar número",
    "phoneVerification.codeLabel": "Código de Verificación",
    "phoneVerification.codeValid": "Código válido por",
    "phoneVerification.verifyButton": "Verificar Número de Teléfono",
    "phoneVerification.verifying": "Verificando...",
    "phoneVerification.resendButton": "Reenviar Código",
    "phoneVerification.resendIn": "Reenviar disponible en",
    "phoneVerification.codeResentTitle": "Código reenviado",
    "phoneVerification.codeResentDesc":
      "Revisa tu WhatsApp para un nuevo código",
    "phoneVerification.success": "Teléfono verificado exitosamente",
    "phoneVerification.successDesc":
      "Ahora puedes recibir notificaciones de WhatsApp",
    "phoneVerification.footer":
      "Recibirás notificaciones importantes sobre tus órdenes de compra",
    "phoneVerification.error.unauthorized":
      "Sesión expirada. Por favor, inicia sesión nuevamente",
    "phoneVerification.error.invalidPhone":
      "Por favor, ingresa un número de teléfono válido (10-15 dígitos)",
    "phoneVerification.error.nameRequired": "Por favor, ingresa tu nombre",
    "phoneVerification.error.invalidCodeFormat":
      "El código debe tener 6 dígitos",
    "phoneVerification.error.codeExpired":
      "Código expirado. Por favor, solicita uno nuevo",
    "phoneVerification.error.invalidCode": "Código inválido.",
    "phoneVerification.error.attemptsLeft": "intentos restantes",
    "phoneVerification.error.cooldown":
      "Por favor, espera {seconds} segundos antes de reenviar",
    "phoneVerification.error.tooManyAttempts":
      "Demasiados intentos. Por favor, solicita un nuevo código",
    "phoneVerification.error.failedToSend":
      "Error al enviar código. Por favor, intenta de nuevo",
    "phoneVerification.error.generic":
      "Ocurrió un error. Por favor, intenta de nuevo",
    "phoneVerification.error.sendFailed": "Error al enviar código",
    "phoneVerification.error.verifyFailed": "Fallo en la verificación",
    "phoneVerification.error.resendFailed": "Error al reenviar código",

    // Dashboard
    "dashboard.title": "Órdenes de Compra",
    "dashboard.subtitle":
      "Gestiona y rastrea todas tus órdenes de compra, arrastra los elementos para cambiar su estado.",
    "dashboard.viewKanban": "Kanban",
    "dashboard.viewTable": "Tabla",

    // Order Status
    "status.pending": "Pendiente",
    "status.approved": "Aprobado",
    "status.declined": "Rechazado",
    "status.changeStatus": "Cambiar Estado",

    // Order Card
    "order.client": "Cliente",
    "order.items": "artículos",
    "order.value": "Valor",
    "order.dueDate": "Vencimiento",
    "order.statusUpdated": "Estado del pedido actualizado a",
    "order.approveSuccess": "Pedido aprobado exitosamente",
    "order.declineSuccess": "Pedido rechazado exitosamente",
    "order.revertSuccess": "Pedido revertido a pendiente exitosamente",
    "order.revertToPending": "Revertir a Pendiente",
    "order.approve": "Aprobar",
    "order.decline": "Rechazar",
    "order.lockedTooltip":
      "Este pedido está esperando la aprobación de un nivel anterior",
    "order.waitingPreviousLevel": "Esperando Nivel Anterior",

    // Order Details
    "orderDetail.title": "Detalles de la Orden de Compra",
    "orderDetail.tabs.overview": "Resumen",
    "orderDetail.tabs.products": "Productos",
    "orderDetail.tabs.approvals": "Aprobaciones",
    "orderDetail.tabs.costCenters": "Centros de Costo",
    "orderDetail.supplierInfo": "Información del Proveedor",
    "orderDetail.supplierName": "Nombre del Proveedor",
    "orderDetail.clientInfo": "Información del Cliente",
    "orderDetail.clientName": "Nombre del Cliente",
    "orderDetail.email": "Correo Electrónico",
    "orderDetail.orderDetails": "Detalles de la Orden",
    "orderDetail.description": "Descripción",
    "orderDetail.addresses": "Direcciones",
    "orderDetail.billingAddress": "Dirección de Facturación",
    "orderDetail.shippingAddress": "Dirección de Envío",
    "orderDetail.orderNumber": "Número de Orden",
    "orderDetail.createdDate": "Fecha de Creación",
    "orderDetail.dueDate": "Fecha de Vencimiento",
    "orderDetail.itemCount": "Cantidad de Artículos",
    "orderDetail.totalItems": "Total de Artículos",
    "orderDetail.totalValue": "Valor Total",
    "orderDetail.branch": "Sucursal",
    "orderDetail.branchCode": "Código de Sucursal",
    "orderDetail.additionalInfo": "Información Adicional",
    "orderDetail.buyer": "Comprador",
    "orderDetail.payment": "Método de Pago",
    "orderDetail.noProducts": "No se encontraron productos",
    "orderDetail.noApprovals": "No hay información de aprobación disponible",
    "orderDetail.noCostCenters": "No se encontraron centros de costo",
    "orderDetail.product.item": "Artículo",
    "orderDetail.product.description": "Descripción",
    "orderDetail.product.partNumber": "Part #",
    "orderDetail.product.unit": "Unidad",
    "orderDetail.product.quantity": "Cant",
    "orderDetail.product.unitPrice": "Precio Unit.",
    "orderDetail.product.total": "Total",
    "orderDetail.product.costCenter": "Centro de Costo",
    "orderDetail.approval.level": "Nivel",
    "orderDetail.costCenter.code": "Código",
    "orderDetail.costCenter.totalValue": "Valor Total",
    "orderDetail.costCenter.percentage": "Porcentaje",

    // Welcome Page
    "welcome.greeting": "Bienvenido de nuevo",
    "welcome.todayOverview": "Resumen de Hoy",
    "welcome.todayStats": "Estadísticas de Hoy",
    "welcome.notifications": "Notificaciones",
    "welcome.pendingApprovals": "Aprobaciones Pendientes",
    "welcome.urgentOrders": "Órdenes Urgentes",
    "welcome.urgentItems": "Elementos Urgentes",
    "welcome.totalValue": "Valor Total",
    "welcome.needsApproval": "Necesita Aprobación",
    "welcome.recentActivity": "Actividad Reciente",
    "welcome.viewAll": "Ver Todas las Órdenes",
    "welcome.viewAllOrders": "Ver Todos los Pedidos",
    "welcome.viewAllCredits": "Ver Todos los Créditos",
    "welcome.purchaseOrders": "Órdenes de Compra",
    "welcome.creditRequests": "Solicitudes de Crédito",
    "welcome.noPendingOrders": "No hay órdenes pendientes de aprobación",
    "welcome.noPendingItems": "No hay elementos pendientes",
    "welcome.allCaughtUp": "¡Buen trabajo! Estás al día.",

    // Admin Dashboard
    "admin.title": "Panel Administrativo",
    "admin.description":
      "Gestionar usuarios, departamentos, roles y posiciones",
    "admin.users": "Usuarios",
    "admin.departments": "Departamentos",
    "admin.roles": "Roles",
    "admin.positions": "Posiciones",
    "admin.noPermission":
      "No tienes permiso para acceder al panel administrativo.",

    // Departments
    "department.title": "Departamentos",
    "department.create": "Crear Departamento",
    "department.edit": "Editar Departamento",
    "department.delete": "Eliminar Departamento",
    "department.name": "Nombre del Departamento",

    // Roles
    "role.title": "Roles",
    "role.create": "Crear Role",
    "role.edit": "Editar Role",
    "role.delete": "Eliminar Role",
    "role.name": "Nombre del Role",
    "role.accessLevel": "Nivel de Acceso",

    // Positions
    "position.title": "Posiciones",
    "position.create": "Crear Posición",
    "position.edit": "Editar Posición",
    "position.delete": "Eliminar Posición",
    "position.name": "Nombre de la Posición",
    "position.description": "Descripción",
    "position.role": "Role",
    "position.department": "Departamento",

    // Users
    "user.name": "Nombre",
    "user.email": "Correo electrónico",
    "user.phone": "Teléfono",
    "user.position": "Posición",
    "user.department": "Departamento",
    "user.role": "Rol",
    "user.firstAccess": "Primer Acceso",
    "user.selectPosition": "Seleccione una posición",
    "user.noPosition": "Sin posición asignada",
    "user.totalUsers": "Total de Usuarios",
    "user.searchUsers": "Buscar usuarios...",
    "user.addUser": "Agregar Usuario",

    // Navigation
    "nav.admin": "Admin",

    // Profile
    "profile.role": "Gerente de Compras",
    "profile.department": "Departamento",
    "profile.loadingProfile": "Cargando perfil...",
    "profile.errorLoading": "No se pudo cargar los detalles del perfil",
    "profile.notSpecified": "No especificado",

    // Pagination
    "pagination.itemsPerPage": "Elementos por página:",

    // Actions
    "actions.approve": "Aprobar",
    "actions.decline": "Rechazar",
    "actions.viewDetails": "Ver Detalles",
    "actions.approving": "Aprobando...",
    "actions.declining": "Rechazando...",

    // Filters
    "filters.filters": "Filtros",
    "filters.search": "Buscar",
    "filters.apply": "Aplicar",
    "filters.clear": "Limpiar Filtros",
    "filters.searchPlaceholder": "Buscar por número de orden o proveedor",
    "filters.status": "Estado",
    "filters.allStatuses": "Todos los Estados",
    "filters.branch": "Sucursal",
    "filters.branchAll": "Todas las Sucursales",
    "filters.dateFrom": "Fecha desde",
    "filters.dateTo": "Fecha hasta",
    "filters.selectDate": "Seleccionar Fecha",

    // Order
    "order.branch": "Sucursal",
    "order.filterByBranch": "Filtrar por sucursal",
    "order.allBranches": "Todas las Sucursales",

    // Table
    "table.orderID": "ID de Orden",
    "table.orderNumber": "Orden Nº",
    "table.supplier": "Proveedor",
    "table.branch": "Sucursal",
    "table.client": "Cliente",
    "table.status": "Estado",
    "table.value": "Valor",
    "table.items": "Artículos",
    "table.dueDate": "Vencimiento",
    "table.actions": "Acciones",

    // Common
    "common.urgent": "Urgente",
    "common.cancel": "Cancelar",
    "common.confirm": "Confirmar",
    "common.yes": "Si",
    "common.no": "No",
    "common.all": "Todos",
    "common.hideFilters": "Ocultar Filtros",

    // Kanban
    "kanban.noOrders": "No hay órdenes",
    kanbanView: "Vista Kanban",
    tableView: "Vista de Tabla",

    // Filters
    filters: "Filtros",
    clearFilters: "Limpar Filtros",
    search: "Pesquisar",
    status: "Status",
    allStatuses: "Todos os Status",
    startDate: "Data Inicial",
    endDate: "Data Final",

    // Credit
    "credit.title": "Gestión de Crédito",
    "credit.subtitle": "Gestione y rastree elementos de flujo de crédito",
    "credit.offer": "Oferta",
    "credit.client": "Cliente",
    "credit.linkedClients": "Clientes Vinculados",
    "credit.value": "Valor",
    "credit.currency": "Moneda",
    "credit.seller": "Vendedor",
    "credit.paymentConditions": "Condiciones de Pago",
    "credit.type": "Tipo",
    "credit.isSN": "Simples Nacional",
    "credit.dueDate": "Fecha de Vencimiento",
    "credit.limit": "Límite",
    "credit.secondaryLimit": "Límite Secundario",
    "credit.firstPurchase": "Primera Compra",
    "credit.biggestPurchase": "Mayor Compra",
    "credit.group": "Grupo",
    "credit.user": "Usuario",
    "credit.noCredits": "No se encontraron elementos de crédito",
    "credit.noCreditsInStatus": "No hay elementos en este estado",
    "credit.noLinkedClients": "No hay clientes vinculados",
    "credit.searchPlaceholder": "Buscar por oferta, cliente o clave",
    "credit.dateRange": "Rango de Fechas",
    "credit.valueRange": "Rango de Valor",
    "credit.filterByType": "Filtrar por Tipo",
    "credit.selectType": "Seleccione el tipo",
    "credit.allTypes": "Todos los Tipos",
    "credit.filterByFinancial": "Filtrar por Estado Financiero",
    "credit.selectFinancial": "Seleccione el estado financiero",
    "credit.allFinancials": "Todos los Estados Financieros",
    "credit.filterByOperation": "Filtrar por Operación",
    "credit.selectOperation": "Seleccione la operación",
    "credit.allOperations": "Todas las Operaciones",
    "credit.overview": "Resumen",
    "credit.store": "Tienda",
    "credit.id": "Id",
    "credit.justifyStatusChange": "Justificar Cambio de Estado",
    "credit.justifyStatusChangeDescription":
      "Por favor, explique por qué está moviendo este crédito a",
    "credit.justification": "Justificación",
    "credit.justificationPlaceholder": "Ingrese su razón (máx 50 caracteres)",
    "credit.documents": "Documentos",
    "credit.foundation": "Fecha de Fundación",
    "credit.lastPurchase": "Última compra",
    "credit.clientInfo": "Info del Cliente",
    "credit.elementInfo": "Información de la Propuesta",
    "credit.salesOrderDetails": "Detalles del Pedido de Venta",
    "credit.branch": "Sucursal",
    "credit.emissionDate": "Fecha de Emisión",
    "credit.shippingType": "Tipo de Envío",
    "credit.shippingCost": "Costo de Envío",
    "credit.message": "Mensaje",
    "credit.salesDocuments": "Documentos de Venta",
    "credit.quoteDocuments": "Documentos de Cotización",
    "credit.clientDocuments": "Documentos del Cliente",
    "credit.noDocuments": "No se encontraron documentos",
    "credit.docTitle": "Título",
    "credit.assignTo": "Asignar artículo a ...",
    "credit.docDescription": "Descripción",
    "credit.clientDetails": "Detalles del Cliente",
    "credit.clientName": "Nombre",
    "credit.cgc": "CGC",
    "credit.cpfCnpj": "CPF/CNPJ",
    "credit.address": "Dirección",
    "credit.risk": "Riesgo",
    "credit.lc": "Límite de Crédito",
    "credit.linkedClientsInfo": "Información sobre clientes vinculados",
    "credit.financialHistory": "Historial Financiero",
    "credit.number": "Número",
    "credit.emission": "Emisión",
    "credit.expiration": "Vencimiento",
    "credit.noClientInfo": "No hay información del cliente disponible",
    "credit.filterByStatus": "Filtrar por Estado",
    "credit.clearFilters": "Limpiar Filtros",
    "credit.totalValue": "Valor Total",
    "credit.totalBalance": "Saldo Abierto ",
    "credit.outstandingAmount": "Importe pendiente",
    "credit.item": "elemento",
    "credit.items": "elementos",
    "credit.status": "Estado",
    "credit.document": "Documento",
    "credit.salesOrder": "Pedido de Venta",
    "credit.realDueDate": "Vencimiento Real",
    "credit.lastPayment": "Pago",
    "credit.balance": "Saldo",
    "credit.noFinancialRecords": "No se encontraron registros financieros",
    "credit.showingItems": "Mostrando",
    "credit.toItems": "a",
    "credit.ofItems": "de",
    "credit.activityLogs": "Registros de actividad",
    "credit.noLogs": "No se encontraron registros de actividad",
    "credit.activityLogsDescription":
      "Consulte los registros de actividad de este elemento",
    "credit.viewLogs": "Ver Registros",

    // Credit Assignment Dialog
    "credit.assign.title": "Asignar elemento de crédito",
    "credit.assign.description":
      "Asigna este elemento de crédito a otro usuario ingresando su correo electrónico.",
    "credit.assign.currentAssignee": "Responsable actual",
    "credit.assign.unassigned": "Sin asignar",
    "credit.assign.emailLabel": "Correo del asignado *",
    "credit.assign.emailPlaceholder": "usuario@ejemplo.com",
    "credit.assign.submit": "Asignar",
    "credit.assign.self": "Asignarme",
      "credit.assign.toSelf": "Asignados a mi",
    "credit.assign.emailRequiredTitle": "Correo requerido",
    "credit.assign.emailRequiredDesc":
      "Por favor, ingresa una dirección de correo.",
    "credit.assign.invalidEmailTitle": "Correo inválido",
    "credit.assign.invalidEmailDesc": "Por favor, ingresa un correo válido.",
    "credit.assign.successTitle": "Elemento asignado",
    "credit.assign.successDesc": "Asignado exitosamente a {email}",
    "credit.assign.permissionDeniedTitle": "Permiso denegado",
    "credit.assign.permissionDeniedDesc":
      "No tienes permiso para asignar este elemento a otro usuario.",
    "credit.assign.failedTitle": "Fallo en la asignación",
    "credit.assign.notFoundOrInvalid":
      "Elemento no encontrado o datos inválidos.",
    "credit.assign.genericError":
      "No se pudo asignar el elemento. Inténtalo nuevamente.",
    "credit.assign.selfSuccessDesc": "Asignado exitosamente a ti.",
    "credit.assign.selfPermissionDeniedDesc":
      "Solo puedes asignarte elementos que no tengan responsable.",

    // Home Page
    "home.pending": "Pendiente",
    "home.urgent": "Urgente",
    "home.value": "Valor Total",

    // Users Management
    "users.title": "Gestión de Usuarios",
    "users.description": "Administre cuentas y permisos de usuarios",
    "users.createUser": "Crear Usuario",
    "users.editUser": "Editar Usuario",
    "users.deleteUser": "Eliminar Usuario",
    "users.searchPlaceholder": "Buscar usuarios...",
    "users.noUsers": "No se encontraron usuarios",
    "users.name": "Nombre",
    "users.email": "Correo",
    "users.department": "Departamento",
    "users.position": "Posición",
    "users.role": "Rol",
    "users.actions": "Acciones",
    "users.created": "Usuario creado exitosamente",
    "users.updated": "Usuario actualizado exitosamente",
    "users.deleted": "Usuario eliminado exitosamente",
    "users.createError": "Error al crear usuario",
    "users.updateError": "Error al actualizar usuario",
    "users.deleteError": "Error al eliminar usuario",
    "users.deleteConfirm": "¿Está seguro de que desea eliminar este usuario?",
    "users.permissionDenied": "No tiene permiso para acceder a esta página",
  },
};

const detectBrowserLocale = (): Locale => {
  // Get browser language(s)
  const browserLang = navigator.language || navigator.languages?.[0] || "";

  // Normalize to lowercase for comparison
  const normalizedLang = browserLang.toLowerCase();

  // Map browser language codes to our supported locales
  // Check for exact matches first
  if (normalizedLang === "en" || normalizedLang.startsWith("en-")) {
    return "en";
  }

  if (normalizedLang === "pt-br" || normalizedLang === "pt") {
    return "pt-BR";
  }

  if (normalizedLang === "es-es" || normalizedLang === "es") {
    return "es-ES";
  }

  // Fallback to pt-BR if no match
  return "pt-BR";
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    // Priority 1: Check for user's saved preference
    const stored = localStorage.getItem("locale");
    if (stored && ["en", "pt-BR", "es-ES"].includes(stored)) {
      console.log("[LocaleProvider] Using saved locale:", stored);
      return stored as Locale;
    }

    // Priority 2: Auto-detect from browser
    const detected = detectBrowserLocale();
    console.log(
      "[LocaleProvider] Auto-detected locale:",
      detected,
      "from browser language:",
      navigator.language,
    );
    return detected;
  });

  useEffect(() => {
    localStorage.setItem("locale", locale);
  }, [locale]);

  const setLocale = (newLocale: Locale) => {
    setLocaleState(newLocale);
  };

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => {
  const context = useContext(LocaleContext);
  if (context === undefined) {
    throw new Error("useLocale must be used within a LocaleProvider");
  }
  return context;
};
