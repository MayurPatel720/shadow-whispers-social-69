
import React from "react";
import { Button } from "@/components/ui/button";

interface MatchesPaginationProps {
  page: number;
  total: number;
  maxResults: number;
  onPageChange: (newPage: number) => void;
}

const MatchesPagination: React.FC<MatchesPaginationProps> = ({
  page,
  total,
  maxResults,
  onPageChange,
}) => (
  <div className="flex gap-2 justify-between items-center mt-4">
    <Button
      size="sm"
      disabled={page === 1}
      onClick={() => onPageChange(page - 1)}
      variant="outline"
    >
      Prev
    </Button>
    <span>Page {page}</span>
    <Button
      size="sm"
      disabled={page * maxResults >= total}
      onClick={() => onPageChange(page + 1)}
      variant="outline"
    >
      Next
    </Button>
  </div>
);

export default MatchesPagination;
