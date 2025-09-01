import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

type BreadcrumbItemType = {
  label: string;
  href?: string;
  className?: string;
  isHighlight?: boolean;
};

type BreadcrumbsProps = {
  items: BreadcrumbItemType[];
};

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <Breadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => {
          const isLast = index === items.length - 1;

          const highlightClass = item.isHighlight
            ? "text-[#2e3090] mb-1 text-xl font-semibold  "
            : "";

          return (
            <div
              key={index}
              className="flex text-[15px] items-center text-primary gap-2"
            >
              <BreadcrumbItem>
                {isLast || !item.href ? (
                  <BreadcrumbPage className={highlightClass}>
                    {item.label}
                  </BreadcrumbPage>
                ) : (
                  <BreadcrumbLink href={item.href}>{item.label}</BreadcrumbLink>
                )}
              </BreadcrumbItem>
              {!isLast && <BreadcrumbSeparator />}
            </div>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
