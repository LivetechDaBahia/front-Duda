const Maintenance = () => {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-6">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-32 -left-32 h-96 w-96 rounded-full bg-primary/5 blur-3xl" />
        <div className="absolute -bottom-32 -right-32 h-96 w-96 rounded-full bg-accent/5 blur-3xl" />
      </div>

      <div className="relative w-full max-w-lg">
        
        <div className="rounded-2xl border border-border bg-card shadow-lg overflow-hidden">

          <div className="h-1.5 w-full bg-gradient-to-r from-primary via-accent to-primary bg-[length:200%_100%] animate-[shimmer_2.5s_linear_infinite]" />

          <div className="p-10 sm:p-12 text-center">
            
            <div className="mx-auto mb-8 relative inline-flex">
              <div className="absolute inset-0 rounded-full bg-primary/10 scale-125 animate-pulse" />
              <div className="relative flex h-28 w-28 items-center justify-center rounded-full bg-secondary border border-border shadow-inner">
                <img
                  src="/maintenance.svg"
                  alt="Manutenção"
                  className="h-16 w-16 object-contain"
                />
              </div>
            </div>

            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Manutenção em andamento
            </h1>

            <p className="mt-4 text-muted-foreground leading-relaxed max-w-sm mx-auto">
              Estamos aprimorando esta área para oferecer uma experiência ainda melhor.
              Em breve, tudo estará disponível novamente.
            </p>

            <div className="mt-8 flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/>
              </svg>
              Use o menu lateral para acessar outras funcionalidades
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Maintenance;
