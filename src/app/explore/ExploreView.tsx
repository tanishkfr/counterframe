"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";

import { IssueRow } from "@/components/issue/IssueRow";
import { EmptyState } from "@/components/primitives";
import { emptyFilter, facetValues, filterIssues } from "@/lib/selectors";
import { SOURCE_TYPE_LABEL } from "@/lib/labels";
import { useStore } from "@/lib/store/AppStore";
import type { IssueSort, IssueStatus, SearchFilter, SourceType } from "@/lib/types";

const STATUSES: IssueStatus[] = ["active", "under-review", "archived"];
const SORTS: Array<{ value: IssueSort; label: string }> = [
  { value: "recently-updated", label: "Recently updated" },
  { value: "most-debated", label: "Most debated" },
  { value: "most-read", label: "Most read" },
];

export function ExploreView() {
  const { db } = useStore();
  const params = useSearchParams();
  const facets = facetValues(db);

  const [filter, setFilter] = useState<SearchFilter>(() => ({
    ...emptyFilter,
    topics: params.get("topic") ? [params.get("topic") as string] : [],
    query: params.get("q") ?? "",
  }));

  const results = useMemo(() => filterIssues(db, filter), [db, filter]);

  const toggle = <K extends "topics" | "countries" | "regions" | "statuses" | "sourceTypes">(
    key: K,
    value: SearchFilter[K][number],
  ) => {
    setFilter((f) => {
      const list = f[key] as Array<typeof value>;
      const next = list.includes(value)
        ? list.filter((v) => v !== value)
        : [...list, value];
      return { ...f, [key]: next } as SearchFilter;
    });
  };

  const activeCount =
    filter.topics.length +
    filter.countries.length +
    filter.regions.length +
    filter.statuses.length +
    filter.sourceTypes.length +
    (filter.hasAdditionalPerspectives ? 1 : 0);

  return (
    <div className="shell page">
      <header className="page-head">
        <p className="eyebrow">Explore</p>
        <h1 className="display">Issues under comparison</h1>
        <p className="lede" style={{ marginBlockStart: "var(--s-4)" }}>
          Each issue places contrasting coverage of the same events side by side, with the panel&rsquo;s
          reasoning, its full revision history, and the money spent on it attached.
        </p>
      </header>

      <form role="search" onSubmit={(e) => e.preventDefault()}>
        <div className="field" style={{ maxWidth: "36rem" }}>
          <label className="field-label" htmlFor="explore-search">
            Search
            <span className="field-hint">
              Issue titles, headlines, authors, outlets, topics, countries and regions. Article
              bodies are not searched, because most records hold excerpts rather than full text.
            </span>
          </label>
          <input
            id="explore-search"
            className="input"
            type="search"
            value={filter.query}
            onChange={(e) => setFilter((f) => ({ ...f, query: e.target.value }))}
            placeholder="Delhi, displacement, Down To Earth…"
          />
        </div>
      </form>

      <div className="filter-bar">
        <div className="field">
          <span className="field-label" id="f-status">
            Status
          </span>
          <div className="chip-row" role="group" aria-labelledby="f-status">
            {STATUSES.map((status) => (
              <button
                key={status}
                type="button"
                className="chip"
                aria-pressed={filter.statuses.includes(status)}
                onClick={() => toggle("statuses", status)}
              >
                {status.replace(/-/g, " ")}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="f-topic">
            Topic
          </span>
          <div className="chip-row" role="group" aria-labelledby="f-topic">
            {facets.topics.map((topic) => (
              <button
                key={topic}
                type="button"
                className="chip"
                aria-pressed={filter.topics.includes(topic)}
                onClick={() => toggle("topics", topic)}
              >
                {topic}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="f-region">
            Region
          </span>
          <div className="chip-row" role="group" aria-labelledby="f-region">
            {facets.regions.map((region) => (
              <button
                key={region}
                type="button"
                className="chip"
                aria-pressed={filter.regions.includes(region)}
                onClick={() => toggle("regions", region)}
              >
                {region}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="f-country">
            Country
          </span>
          <div className="chip-row" role="group" aria-labelledby="f-country">
            {facets.countries.map((country) => (
              <button
                key={country}
                type="button"
                className="chip"
                aria-pressed={filter.countries.includes(country)}
                onClick={() => toggle("countries", country)}
              >
                {country}
              </button>
            ))}
          </div>
        </div>

        <div className="field">
          <span className="field-label" id="f-source">
            Source type
          </span>
          <div className="chip-row" role="group" aria-labelledby="f-source">
            {(["news-report", "wire-service", "state-broadcaster", "ngo-report"] as SourceType[]).map(
              (type) => (
                <button
                  key={type}
                  type="button"
                  className="chip"
                  aria-pressed={filter.sourceTypes.includes(type)}
                  onClick={() => toggle("sourceTypes", type)}
                >
                  {SOURCE_TYPE_LABEL[type]}
                </button>
              ),
            )}
          </div>
        </div>

        <div className="field">
          <label className="switch">
            <input
              type="checkbox"
              checked={filter.hasAdditionalPerspectives}
              onChange={(e) =>
                setFilter((f) => ({ ...f, hasAdditionalPerspectives: e.target.checked }))
              }
            />
            Additional perspectives available
          </label>
        </div>

        <div className="field">
          <label className="field-label" htmlFor="explore-sort">
            Sort
          </label>
          <select
            id="explore-sort"
            className="select"
            value={filter.sort}
            onChange={(e) => setFilter((f) => ({ ...f, sort: e.target.value as IssueSort }))}
          >
            {SORTS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {activeCount > 0 && (
          <button
            type="button"
            className="btn"
            data-variant="quiet"
            onClick={() => setFilter({ ...emptyFilter, query: filter.query })}
          >
            Clear {activeCount} filter{activeCount === 1 ? "" : "s"}
          </button>
        )}
      </div>

      <p className="meta" style={{ marginBlock: "var(--s-4)" }} role="status">
        {results.length} issue{results.length === 1 ? "" : "s"}
        {filter.query ? ` matching “${filter.query}”` : ""}
      </p>

      {results.length === 0 ? (
        <EmptyState
          title="Nothing matches those filters"
          action={
            <button
              type="button"
              className="btn"
              data-variant="primary"
              onClick={() => setFilter(emptyFilter)}
            >
              Clear all filters
            </button>
          }
        >
          Counterframe publishes a small number of issues deliberately: each one takes source
          verification, panel review and translation before it can go up. Try removing a filter, or
          propose an issue you would like to see compared.
        </EmptyState>
      ) : (
        <ul className="issue-rows">
          {results.map((issue) => (
            <IssueRow key={issue.id} issue={issue} />
          ))}
        </ul>
      )}

      <section style={{ marginBlockStart: "var(--s-7)" }}>
        <div className="section-head">
          <h2>Do not see what you expected?</h2>
        </div>
        <p style={{ maxWidth: "44rem" }}>
          Anyone with an account can propose an issue. Every proposal receives a published panel
          decision, including the rejections and the neutral rewrites.
        </p>
        <p style={{ marginBlockStart: "var(--s-4)" }}>
          <Link href="/propose" className="btn" data-variant="primary">
            Propose an issue
          </Link>{" "}
          <Link href="/transparency#proposals" className="btn">
            See past decisions
          </Link>
        </p>
      </section>
    </div>
  );
}
