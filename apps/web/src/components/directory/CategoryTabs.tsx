import { CategoryBadge, cn } from '@midnightmunches/ui';

import { CATEGORIES, type Category } from '@/lib/stalls';

type CategoryTabsProps = {
  active: Category | undefined;
  getCount: (category: Category | undefined) => number;
  onSelect: (category: Category | undefined) => void;
};

// NOTE: toggle buttons, not role="tab": every option filters the same grid, so there are no
// tab panels to own.
export function CategoryTabs({ active, getCount, onSelect }: CategoryTabsProps) {
  return (
    <div className="flex flex-wrap justify-center gap-x-24 gap-y-8 px-16">
      {[undefined, ...CATEGORIES].map((category) => (
        <button
          aria-pressed={category === active}
          className={cn(
            'inline-flex min-h-[44px] items-center gap-8 border-b-2 border-transparent font-body text-[20px] leading-body font-medium tracking-body-sm text-blush-highlight uppercase transition-colors hover:text-bone-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-bone-white',
            category === active && 'border-electric-red',
          )}
          key={category ?? 'all'}
          onClick={() => onSelect(category)}
          type="button"
        >
          {category ? category.replace('-', ' ') : 'All'}
          <CategoryBadge count={getCount(category)} />
        </button>
      ))}
    </div>
  );
}
