import { useWorlds } from "../../supabaseClient";
import { Link } from "wouter";
import Auth from "../../Auth";
import {
  Box,
  SimpleGrid,
  Alert,
  AlertDescription,
  AlertIcon,
  CardFooter,
  Stack,
  Card,
  CardBody,
  Heading,
} from "@chakra-ui/react";

export default function HomeView() {
  const [worlds, error] = useWorlds();

  return (
    <Box maxW="800px" p={4}>
      <Heading size="xl">Worlds</Heading>

      {error ? (
        <Alert status="error">
          <AlertIcon />
          <AlertDescription>Error loading worlds</AlertDescription>
        </Alert>
      ) : null}

      <SimpleGrid columns={2} gap={8}>
        {worlds.map((world) => (
          <Card>
            <CardBody>
              {/* <Image
                src="https://images.unsplash.com/photo-1555041469-a586c61ea9bc?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1770&q=80"
                alt="Green double couch with wooden legs"
                borderRadius="lg"
              /> */}
              <Stack mt="6" spacing="3">
                <Heading size="md">{world.name}</Heading>
              </Stack>
            </CardBody>
            <CardFooter>
              <Link href={`/${world.slug}`}>View world</Link>
              {/* <Button variant="ghost" colorScheme="blue">
                View world
              </Button> */}
            </CardFooter>
          </Card>
        ))}
      </SimpleGrid>

      <Auth />
    </Box>
  );
}
