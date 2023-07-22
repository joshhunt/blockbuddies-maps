import React, { useCallback } from "react";
import { NewFeatureRow, WorldRow } from "./types";
import {
  Button,
  Flex,
  FormControl,
  FormLabel,
  HStack,
  Heading,
  Input,
  Select,
  VStack,
} from "@chakra-ui/react";

interface NewFeatureFormProps {
  world: WorldRow;
  initialValues?: Partial<NewFeatureRow>;
  onNewFeature: (newFeature: NewFeatureRow) => void;
  onCancel: () => void;
}

function getFormValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  if (typeof value !== "string") {
    throw new Error("invalid field type");
  }

  return value;
}

const NewFeatureForm: React.FC<NewFeatureFormProps> = ({
  world,
  initialValues,
  onNewFeature,
  onCancel,
}) => {
  const handleSubmit = useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const name = getFormValue(formData, "name");
      const dimension = getFormValue(formData, "dimension");
      const icon = "pin";
      const posX = getFormValue(formData, "pos_x");
      const posZ = getFormValue(formData, "pos_z");

      if (name && dimension && icon && posX && posZ) {
        onNewFeature({
          name,
          world: world.id,
          dimension: dimension,
          icon,
          pos_x: parseInt(posX),
          pos_z: parseInt(posZ),
        });
      }
    },
    [onNewFeature, world.id]
  );

  const handleSelectRef = useCallback(
    (ref: HTMLSelectElement) => {
      if (ref && initialValues?.dimension) {
        ref.value = initialValues.dimension;
      }
    },
    [initialValues?.dimension]
  );

  return (
    <form onSubmit={handleSubmit}>
      <VStack spacing="4" align="flex-start">
        <Heading size="md">New Pin</Heading>

        <FormControl>
          <FormLabel>Name</FormLabel>
          <Input required name="name" />
        </FormControl>

        <FormControl>
          <FormLabel>Dimension</FormLabel>

          <Select required name="dimension" ref={handleSelectRef}>
            <option value="overworld">Overworld</option>
            <option value="nether">Nether</option>
            <option value="end">The End</option>
          </Select>
        </FormControl>

        <HStack spacing="4">
          <FormControl>
            <FormLabel>X</FormLabel>
            <Input required name="pos_x" />
          </FormControl>

          <FormControl>
            <FormLabel>Z</FormLabel>
            <Input required name="pos_z" />
          </FormControl>
        </HStack>

        <Flex width="100%" justify="space-between">
          <Button type="submit" colorScheme="green">
            Save
          </Button>
          <Button onClick={onCancel} colorScheme="orange" variant="outline">
            Cancel
          </Button>
        </Flex>
      </VStack>
    </form>
  );
};

export default NewFeatureForm;
