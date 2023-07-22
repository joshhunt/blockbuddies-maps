import { useWorlds } from "../../supabaseClient";
import { Link } from "wouter";
import Auth from "../../Auth";
import { Heading } from "@chakra-ui/react";

export default function HomeView() {
  const [worlds, error] = useWorlds();

  return (
    <div>
      <Heading size="2xl">Worlds</Heading>
      <h2>Worlds</h2>

      {error ? <div>error loading worlds</div> : null}

      <ul>
        {worlds.map((world) => (
          <li>
            <Link href={`/${world.slug}`}> {world.name}</Link>
          </li>
        ))}
      </ul>

      <Auth />
    </div>
  );
}
