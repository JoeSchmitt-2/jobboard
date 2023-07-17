import './App.css';
import { FC, useEffect, useState } from 'react';

interface IProps {
  url: string;
  by: string;
  time: number;
  title: string;
}

const JobPosting : FC<IProps> = ({ url, by, time, title }) => {
  return (
    <div className="post" role="listitem">
      <h2 className="post__title">
        {url ? (
          <a
            className="post__title__link"
            href={url}
            target="_blank"
            rel="noopener">
            {title}
          </a>
        ) : (
          title
        )}
      </h2>
      <p className="post__metadata">
        By {by} &middot;{' '}
        {new Date(time * 1000).toLocaleString()}
      </p>
    </div>
  );
}

const PAGE_SIZE = 6;



function App() {
  const [fetchingJobDetails, setFetchingJobDetails] = useState(false);
  const [jobIds, setJobIds] = useState(null);
  const [jobs, setJobs] = useState([] as any[]);
  const [page, setPage] = useState(0);

  useEffect(() => {
    fetchJobs(page);
  }, [page]);

  async function fetchJobIds(currPage: any) {
    let jobs = jobIds;
    if (!jobs) {
      const res = await fetch(
        'https://hacker-news.firebaseio.com/v0/jobstories.json',
      );
      jobs = await res.json();
      setJobIds(jobs);
    }

    const start = currPage * PAGE_SIZE;
    const end = start + PAGE_SIZE;
    return jobs.slice(start, end);
  }

  async function fetchJobs(currPage: any) {
    const jobIdsForPage = await fetchJobIds(currPage);

    setFetchingJobDetails(true);
    const jobsForPage = await Promise.all(
      jobIdsForPage.map((jobId: any) =>
        fetch(
          `https://hacker-news.firebaseio.com/v0/item/${jobId}.json`,
        ).then((res) => res.json()),
      ),
    );
    setJobs([...jobs, ...jobsForPage]);

    setFetchingJobDetails(false);
  }



  return (
    <>
      <header>By Joseph Schmitt</header>
      <div className="columns">
        <nav>Navigation</nav>
        <main>
        <div className="app">
        <h1 className="title">Hacker News Jobs Board</h1>
          {jobIds == null ? (
            <p className="loading">Loading...</p>
            ) : (
            <div>
              <div className="jobs" role="list">
                {jobs.map((job) => (
                  <JobPosting key={job.id} {...job} />
                ))}
              </div>
              {jobs.length > 0 &&
                page * PAGE_SIZE + PAGE_SIZE <
                  jobIds.length && (
                  <button
                    className="load-more-button"
                    disabled={fetchingJobDetails}
                    onClick={() => setPage(page + 1)}>
                    {fetchingJobDetails
                      ? 'Loading...'
                      : 'Load more jobs'}
                  </button>
              )}
              </div>
            )}
            </div>



        </main>
        <aside>Sidebar</aside>
      </div>
      <footer>Footer</footer>
    </>
  );
}

export default App;
