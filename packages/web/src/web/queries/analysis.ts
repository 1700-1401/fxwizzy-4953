import { useMutation } from '@tanstack/react-query';
import { orpc } from '../lib/api';
export const useAnalysis = () => useMutation(orpc.analysis.analyze.mutationOptions());
export const useMentor = () => useMutation(orpc.analysis.mentor.mutationOptions());