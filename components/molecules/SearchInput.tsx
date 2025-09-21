import { Input } from "../atoms/Input";
import { SearchIcon } from "../atoms/Icons";

interface SearchInputProps {
  placeholder?: string;
  className?: string;
}

export const SearchInput: React.FC<SearchInputProps> = ({
  placeholder = "Search...",
  className = "",
}) => {
  return (
    <div className={`relative ${className}`}>
      <Input type="text" placeholder={placeholder} className="pl-10" />
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <SearchIcon className="text-gray-400" />
      </div>
    </div>
  );
};
