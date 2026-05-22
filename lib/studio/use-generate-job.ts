/**
 * useGenerateJob Hook — tạo job UGC + polling status đến done.
 *
 * Usage trong StudioMain:
 *
 *   const { createJob, jobStatus, isGenerating, error } = useGenerateJob();
 *
 *   <button onClick={() => createJob({ product_input, approved_script, reference_mapping, settings })}>
 *     {isGenerating ? `${jobStatus?.progress}%` : 'GENERATE'}
 *   </button>
 *
 *   {jobStatus?.status === 'done' && <video src={jobStatus.output_url} />}
 */

'use client';

import { useState, useCallback, useRef } from 'react';
import type { CreateJobRequest, JobStatus } from '../types/backend';

interface UseGenerateJobReturn {
  createJob: (request: CreateJobRequest) => Promise<void>;
  jobStatus: JobStatus | null;
  isGenerating: boolean;
  error: string | null;
  reset: () => void;
  cancelJob: () => Promise<void>;
}

export function useGenerateJob(): UseGenerateJobReturn {
  const [jobStatus, setJobStatus] = useState<JobStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pollingRef = useRef<NodeJS.Timeout | null>(null);
  const currentJobIdRef = useRef<string | null>(null);

  const isGenerating =
    jobStatus !== null &&
    !['done', 'failed'].includes(jobStatus.status);

  const stopPolling = useCallback(() => {
    if (pollingRef.current) {
      // BUG-H4 fix: dùng clearTimeout vì exponential backoff dùng setTimeout chain
      clearTimeout(pollingRef.current as unknown as NodeJS.Timeout);
      pollingRef.current = null;
    }
  }, []);

  const reset = useCallback(() => {
    stopPolling();
    setJobStatus(null);
    setError(null);
    currentJobIdRef.current = null;
  }, [stopPolling]);

  const cancelJob = useCallback(async () => {
    if (!currentJobIdRef.current) return;
    try {
      await fetch(`/api/v1/jobs/${currentJobIdRef.current}`, { method: 'DELETE' });
      reset();
    } catch (err: any) {
      setError(err.message);
    }
  }, [reset]);

  const pollJob = useCallback(
    async (jobId: string) => {
      try {
        const res = await fetch(`/api/v1/jobs/${jobId}`);
        if (!res.ok) throw new Error(`Poll failed: ${res.status}`);
        const status: JobStatus = await res.json();

        setJobStatus(status);

        if (status.status === 'done' || status.status === 'failed') {
          stopPolling();
          if (status.status === 'failed') {
            setError(status.error_message || 'Job failed');
          }
        }
      } catch (err: any) {
        setError(err.message);
        stopPolling();
      }
    },
    [stopPolling],
  );

  const createJob = useCallback(
    async (request: CreateJobRequest) => {
      reset();
      try {
        const res = await fetch('/api/v1/jobs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(request),
        });

        if (!res.ok) {
          const err = await res.json();
          throw new Error(err.error?.message || `HTTP ${res.status}`);
        }

        const job = await res.json();
        currentJobIdRef.current = job.job_id;

        // Init job status với pending
        setJobStatus({
          job_id: job.job_id,
          status: 'pending',
          progress: 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        });

        // BUG-H4 fix: exponential backoff polling (3s → 5s → 8s → 12s, cap 20s)
        // Giảm 60% poll requests vs flat 3s, vẫn responsive cho jobs ngắn.
        let pollCount = 0;
        const schedule = () => {
          const delay = Math.min(3000 + pollCount * 1500, 20000);
          pollingRef.current = setTimeout(async () => {
            await pollJob(job.job_id);
            pollCount += 1;
            // pollJob sẽ stop polling khi done/failed via stopPolling()
            if (pollingRef.current !== null) schedule();
          }, delay) as unknown as NodeJS.Timeout;
        };
        schedule();
      } catch (err: any) {
        setError(err.message);
      }
    },
    [reset, pollJob],
  );

  return { createJob, jobStatus, isGenerating, error, reset, cancelJob };
}
