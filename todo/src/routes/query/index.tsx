import {
  useQuery,
  useMutation,
  useQueryClient,
  QueryClient,
  QueryClientProvider,
} from "@tanstack/react-query";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState } from "react";

const queryClient = new QueryClient();

export const Route = createFileRoute("/query/")({
  component: () => {
    return (
      <QueryClientProvider client={queryClient}>
        <Query />
      </QueryClientProvider>
    );
  },
});

function Query() {
  const [id, setId] = useState("");
  const query = useQuery({
    queryKey: ["poke", id],
    queryFn: () => getPokemon(id),
  });

  const pokemon = query.data;
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold">Welcome to TanStack Start</h1>
      <p className="mt-4 text-lg">おら query で 遊ぶぞ</p>
      <input type="text" onChange={(e) => setId(e.target.value)} value={id} />
      {query.error && <div>error だぼけ</div>}
      {pokemon ? (
        <div>
          <p>{pokemon.name}</p>
          <img src={pokemon.img} alt={pokemon.name} />
        </div>
      ) : (
        <div>わからん</div>
      )}

      {query.isLoading && <div>loading</div>}
    </div>
  );
}

type Poke = {
  name: string;
  img: string;
};

const getPokemon = async (id: string) => {
  const res = await fetch(`https://pokeapi.co/api/v2/pokemon/${id}`);

  if (!res.ok) throw Error;

  const data = await res.json();
  const poke: Poke = {
    name: data.name,
    img: data.sprites.front_default,
  };

  return poke;
};
