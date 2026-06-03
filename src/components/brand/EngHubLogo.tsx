import logoPng from '@/assets/images/brand/logo.png';

interface EngHubLogoProps {
  className?: string;
  markClassName?: string;
  textClassName?: string;
}

export const EngHubLogo = ({
  className = '',
  markClassName = 'h-9 w-14',
  textClassName = 'text-3xl',
}: EngHubLogoProps) => {
  return (
    <span className={`inline-flex items-center gap-2.5 ${className}`}>
      <img
        src={logoPng}
        alt=""
        aria-hidden="true"
        className={`${markClassName} object-contain`}
      />
      <span className={`${textClassName} font-extrabold leading-none tracking-[-0.015em] text-[#0f172a]`}>
        Eng<span className="text-[#004ac6]">Hub</span>
      </span>
    </span>
  );
};
