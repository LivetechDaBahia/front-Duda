import React, { createContext, useContext, useState, useEffect } from "react";

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
    "nav.brandName": "WDC Net",

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

    // Dashboard
    "dashboard.title": "Purchase Orders",
    "dashboard.subtitle": "Manage and track all your purchase orders",
    "dashboard.viewKanban": "Kanban",
    "dashboard.viewTable": "Table",

    // Order Status
    "status.pending": "Pending",
    "status.processing": "Processing",
    "status.approved": "Approved",
    "status.inProgress": "In Progress",
    "status.completed": "Completed",
    "status.cancelled": "Cancelled",
    "status.declined": "Declined",
    "status.changeStatus": "Change Status",

    // Order Card
    "order.client": "Client",
    "order.items": "items",
    "order.value": "Value",
    "order.dueDate": "Due",
    "order.statusUpdated": "Order status updated to",

    // Order Details
    "orderDetail.title": "Purchase Order Details",
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

    // Welcome Page
    "welcome.greeting": "Welcome back",
    "welcome.todayOverview": "Today's Overview",
    "welcome.todayStats": "Today's Statistics",
    "welcome.pendingApprovals": "Pending Approvals",
    "welcome.urgentOrders": "Urgent Orders",
    "welcome.totalValue": "Total Value",
    "welcome.recentActivity": "Recent Activity",
    "welcome.viewAll": "View All Orders",
    "welcome.noPendingOrders": "No orders pending approval",
    "welcome.allCaughtUp": "Great job! You're all caught up.",

    // Profile
    "profile.role": "Purchase Manager",

    // Actions
    "actions.approve": "Approve",
    "actions.decline": "Decline",
    "actions.viewDetails": "View Details",
    "actions.approving": "Approving...",
    "actions.declining": "Declining...",

    // Table
    "table.orderID": "Order ID",
    "table.orderNumber": "Order #",
    "table.client": "Client",
    "table.status": "Status",
    "table.value": "Value",
    "table.items": "Items",
    "table.dueDate": "Due Date",
    "table.actions": "Actions",

    // Common
    "common.urgent": "Urgent",
  },
  "pt-BR": {
    // Navigation
    "nav.home": "Início",
    "nav.purchaseOrders": "Ordens de Compra",
    "nav.brandName": "WDC Net",

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

    // Dashboard
    "dashboard.title": "Ordens de Compra",
    "dashboard.subtitle": "Gerencie e acompanhe todas as suas ordens de compra",
    "dashboard.viewKanban": "Kanban",
    "dashboard.viewTable": "Tabela",

    // Order Status
    "status.pending": "Pendente",
    "status.processing": "Processando",
    "status.approved": "Aprovado",
    "status.inProgress": "Em Progresso",
    "status.completed": "Concluído",
    "status.cancelled": "Cancelado",
    "status.declined": "Recusado",
    "status.changeStatus": "Alterar Status",

    // Order Card
    "order.client": "Cliente",
    "order.items": "itens",
    "order.value": "Valor",
    "order.dueDate": "Vencimento",
    "order.statusUpdated": "Status da ordem atualizado para",

    // Order Details
    "orderDetail.title": "Detalhes da Ordem de Compra",
    "orderDetail.clientInfo": "Informações do Cliente",
    "orderDetail.clientName": "Nome do Cliente",
    "orderDetail.email": "E-mail",
    "orderDetail.orderDetails": "Detalhes da Ordem",
    "orderDetail.description": "Descrição",
    "orderDetail.addresses": "Endereços",
    "orderDetail.billingAddress": "Endereço de Cobrança",
    "orderDetail.shippingAddress": "Endereço de Entrega",
    "orderDetail.orderNumber": "Número da Ordem",
    "orderDetail.createdDate": "Data de Criação",
    "orderDetail.dueDate": "Data de Vencimento",
    "orderDetail.itemCount": "Quantidade de Itens",
    "orderDetail.totalItems": "Total de Itens",
    "orderDetail.totalValue": "Valor Total",

    // Welcome Page
    "welcome.greeting": "Bem-vindo de volta",
    "welcome.todayOverview": "Visão Geral de Hoje",
    "welcome.todayStats": "Estatísticas de Hoje",
    "welcome.pendingApprovals": "Aprovações Pendentes",
    "welcome.urgentOrders": "Ordens Urgentes",
    "welcome.totalValue": "Valor Total",
    "welcome.recentActivity": "Atividade Recente",
    "welcome.viewAll": "Ver Todas as Ordens",
    "welcome.noPendingOrders": "Nenhuma ordem pendente de aprovação",
    "welcome.allCaughtUp": "Ótimo trabalho! Você está em dia.",

    // Profile
    "profile.role": "Gerente de Compras",

    // Actions
    "actions.approve": "Aprovar",
    "actions.decline": "Recusar",
    "actions.viewDetails": "Ver Detalhes",
    "actions.approving": "Aprovando...",
    "actions.declining": "Recusando...",

    // Table
    "table.orderID": "ID da Ordem",
    "table.orderNumber": "Ordem Nº",
    "table.client": "Cliente",
    "table.status": "Status",
    "table.value": "Valor",
    "table.items": "Itens",
    "table.dueDate": "Vencimento",
    "table.actions": "Ações",

    // Common
    "common.urgent": "Urgente",
  },
  "es-ES": {
    // Navigation
    "nav.home": "Inicio",
    "nav.purchaseOrders": "Órdenes de Compra",
    "nav.brandName": "WDC Net",

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

    // Dashboard
    "dashboard.title": "Órdenes de Compra",
    "dashboard.subtitle": "Gestiona y rastrea todas tus órdenes de compra",
    "dashboard.viewKanban": "Kanban",
    "dashboard.viewTable": "Tabla",

    // Order Status
    "status.pending": "Pendiente",
    "status.processing": "Procesando",
    "status.approved": "Aprobado",
    "status.inProgress": "En Progreso",
    "status.completed": "Completado",
    "status.cancelled": "Cancelado",
    "status.declined": "Rechazado",
    "status.changeStatus": "Cambiar Estado",

    // Order Card
    "order.client": "Cliente",
    "order.items": "artículos",
    "order.value": "Valor",
    "order.dueDate": "Vencimiento",
    "order.statusUpdated": "Estado de la orden actualizado a",

    // Order Details
    "orderDetail.title": "Detalles de la Orden de Compra",
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

    // Welcome Page
    "welcome.greeting": "Bienvenido de nuevo",
    "welcome.todayOverview": "Resumen de Hoy",
    "welcome.todayStats": "Estadísticas de Hoy",
    "welcome.pendingApprovals": "Aprobaciones Pendientes",
    "welcome.urgentOrders": "Órdenes Urgentes",
    "welcome.totalValue": "Valor Total",
    "welcome.recentActivity": "Actividad Reciente",
    "welcome.viewAll": "Ver Todas las Órdenes",
    "welcome.noPendingOrders": "No hay órdenes pendientes de aprobación",
    "welcome.allCaughtUp": "¡Buen trabajo! Estás al día.",

    // Profile
    "profile.role": "Gerente de Compras",

    // Actions
    "actions.approve": "Aprobar",
    "actions.decline": "Rechazar",
    "actions.viewDetails": "Ver Detalles",
    "actions.approving": "Aprobando...",
    "actions.declining": "Rechazando...",

    // Table
    "table.orderID": "ID de Orden",
    "table.orderNumber": "Orden Nº",
    "table.client": "Cliente",
    "table.status": "Estado",
    "table.value": "Valor",
    "table.items": "Artículos",
    "table.dueDate": "Vencimiento",
    "table.actions": "Acciones",

    // Common
    "common.urgent": "Urgente",
  },
};

export const LocaleProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const stored = localStorage.getItem("locale");
    return (stored as Locale) || "en";
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
