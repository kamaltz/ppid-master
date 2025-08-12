interface CardProps {
  children: React.ReactNode;
  className?: string;
}

interface CardHeaderProps {
  children: React.ReactNode;
  className?: string;
}

interface CardTitleProps {
  children: React.ReactNode;
}

interface CardDescriptionProps {
  children: React.ReactNode;
}

export const Card = ({ children, className = "" }: CardProps) => (
  <div className={`bg-white rounded-lg shadow-md border ${className}`}>
    {children}
  </div>
);

export const CardHeader = ({ children, className = "" }: CardHeaderProps) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

export const CardTitle = ({ children }: CardTitleProps) => (
  <h3 className="text-lg font-semibold text-gray-800 mb-2">
    {children}
  </h3>
);

export const CardDescription = ({ children }: CardDescriptionProps) => (
  <p className="text-gray-600 text-sm">
    {children}
  </p>
);