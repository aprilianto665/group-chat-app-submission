import { Heading } from "../atoms/Heading";

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  className?: string;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  className = "",
}) => {
  return (
    <div className={`space-y-6 ${className}`}>
      <div className="space-y-2">
        <Heading level={1} className="text-gray-900 leading-tight">
          {title}
        </Heading>
        {subtitle && (
          <Heading level={2} className="text-gray-600 font-normal">
            {subtitle}
          </Heading>
        )}
      </div>
    </div>
  );
};
