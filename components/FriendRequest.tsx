import { getPendingRequests } from "@/lib/db/queries";
// Immagina di avere già le action accept/reject pronte
import { acceptFriendRequest, rejectFriendRequest } from "@/lib/db/actions/friendship";

export default async function FriendRequests({ userId }: { userId: string }) {
  const requests = await getPendingRequests(userId);

  if (requests.length === 0) return <p className="text-slate-500">Nessuna richiesta.</p>;

  return (
    <div className="space-y-4">
      {requests.map((req) => (
        <div key={req.id} className="flex items-center justify-between p-3 bg-slate-800 rounded-lg">
          <span className="font-medium text-purple-400">@{req.requester.nexusTag}</span>
          <div className="flex gap-2">
            <button 
              onClick={async () => { "use client"; await acceptFriendRequest(req.id, userId); }}
              className="bg-green-600 px-3 py-1 rounded text-sm hover:bg-green-500"
            >
              Accetta
            </button>
            <button 
              className="bg-red-600 px-3 py-1 rounded text-sm hover:bg-red-500"
            >
              Rifiuta
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}