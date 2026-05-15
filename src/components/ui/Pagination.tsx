import Link from 'next/link';
import {
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
} from 'lucide-react';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
}

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  const pages = [];
  const maxPagesToShow = 5;

  let startPage = Math.max(
    1,
    currentPage - Math.floor(maxPagesToShow / 2)
  );

  let endPage = Math.min(
    totalPages,
    startPage + maxPagesToShow - 1
  );

  if (endPage - startPage + 1 < maxPagesToShow) {
    startPage = Math.max(
      1,
      endPage - maxPagesToShow + 1
    );
  }

  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }

  if (totalPages <= 1) return null;

  return (
    <div className="mt-12 flex flex-wrap items-center justify-center gap-2">
      {/* Previous */}
      <Link
        href={`?page=${Math.max(currentPage - 1, 1)}`}
        className={`group inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-all duration-300 ${
          currentPage === 1
            ? 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
            : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-[#247a95]/30 hover:bg-[#247a95] hover:text-white hover:shadow-md'
        }`}
      >
        <ChevronLeft className="mr-1 h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
        Previous
      </Link>

      {/* First Page */}
      {startPage > 1 && (
        <>
          <PageButton
            page={1}
            currentPage={currentPage}
          />

          {startPage > 2 && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )}
        </>
      )}

      {/* Middle Pages */}
      {pages.map((page) => (
        <PageButton
          key={page}
          page={page}
          currentPage={currentPage}
        />
      ))}

      {/* Last Page */}
      {endPage < totalPages && (
        <>
          {endPage < totalPages - 1 && (
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-gray-200 bg-white text-gray-400 shadow-sm">
              <MoreHorizontal className="h-4 w-4" />
            </div>
          )}

          <PageButton
            page={totalPages}
            currentPage={currentPage}
          />
        </>
      )}

      {/* Next */}
      <Link
        href={`?page=${Math.min(
          currentPage + 1,
          totalPages
        )}`}
        className={`group inline-flex h-11 items-center justify-center rounded-xl border px-4 text-sm font-medium transition-all duration-300 ${
          currentPage === totalPages
            ? 'pointer-events-none border-gray-200 bg-gray-100 text-gray-400'
            : 'border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-[#247a95]/30 hover:bg-[#247a95] hover:text-white hover:shadow-md'
        }`}
      >
        Next
        <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
      </Link>
    </div>
  );
}

function PageButton({
  page,
  currentPage,
}: {
  page: number;
  currentPage: number;
}) {
  const isActive = currentPage === page;

  return (
    <Link
      href={`?page=${page}`}
      className={`flex h-11 w-11 items-center justify-center rounded-xl text-sm font-semibold transition-all duration-300 ${
        isActive
          ? 'scale-105 bg-[#247a95] text-white shadow-lg shadow-[#247a95]/25'
          : 'border border-gray-200 bg-white text-gray-700 shadow-sm hover:-translate-y-0.5 hover:border-[#247a95]/30 hover:bg-[#247a95] hover:text-white hover:shadow-md'
      }`}
    >
      {page}
    </Link>
  );
}