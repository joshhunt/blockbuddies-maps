import React, { useCallback } from "react";
import { NewFeatureRow, WorldRow } from "./types";

interface NewFeatureFormProps {
  onNewFeature: (newFeature: NewFeatureRow) => void;
  world: WorldRow;
}

function getFormValue(formData: FormData, fieldName: string) {
  const value = formData.get(fieldName);
  if (typeof value !== "string") {
    throw new Error("invalid field type");
  }

  return value;
}

const NewFeatureForm: React.FC<NewFeatureFormProps> = ({
  onNewFeature,
  world,
}) => {
  const handleSubmit = useCallback(
    (ev: React.FormEvent<HTMLFormElement>) => {
      ev.preventDefault();
      const formData = new FormData(ev.currentTarget);
      const name = getFormValue(formData, "name");
      const dimension = getFormValue(formData, "dimension");
      const icon = getFormValue(formData, "icon");
      const posX = getFormValue(formData, "pos_x");
      const posY = getFormValue(formData, "pos_y");

      if (name && dimension && icon && posX && posY) {
        onNewFeature({
          name,
          world: world.id,
          dimension: parseInt(dimension),
          icon,
          pos_x: parseInt(posX),
          pos_y: parseInt(posY),
        });
      }
    },
    [onNewFeature, world.id]
  );

  return (
    <form onSubmit={handleSubmit}>
      <table>
        <tbody>
          <FieldRow label="Name" fieldName="name" type="text" />
          <FieldRow label="Dimension" fieldName="dimension" type="number" />
          <FieldRow label="Icon" fieldName="icon" type="text" />
          <FieldRow label="Pos X" fieldName="pos_x" type="text" />
          <FieldRow label="Pos Y" fieldName="pos_y" type="text" />
          <tr>
            <td>
              <button type="submit">Save</button>
            </td>
          </tr>
        </tbody>
      </table>
    </form>
  );
};

export default NewFeatureForm;

interface FieldRowProps {
  label: string;
  fieldName: string;
  type: string;
}

const FieldRow: React.FC<FieldRowProps> = ({ label, fieldName, type }) => {
  return (
    <tr>
      <td>{label}</td>
      <td>
        <input name={fieldName} type={type} />
      </td>
    </tr>
  );
};
