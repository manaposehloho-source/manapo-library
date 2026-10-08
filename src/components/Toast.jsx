import { useLibrary } from '../context/LibraryContext.jsx';

export default function Toast() {
  const { toast } = useLibrary();
  if (!toast) return null;
  return <div className={'toast' + (toast.isError ? ' error' : '')}>{toast.message}</div>;
}
