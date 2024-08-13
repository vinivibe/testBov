import Realm from "realm";

class FarmerSchema extends Realm.Object {}
FarmerSchema.schema = {
  name: "Farmer",
  properties: {
    name: "string",
    city: "string",
  },
};

class FromToSchema extends Realm.Object {}
FromToSchema.schema = {
  name: "FromTo",
  properties: {
    name: "string",
  },
};

class LocationSchema extends Realm.Object {}
LocationSchema.schema = {
  name: "Location",
  properties: {
    latitude: "double",
    longitude: "double",
  },
};

class ChecklistSchema extends Realm.Object {}
ChecklistSchema.schema = {
  name: "Checklist",
  properties: {
    _id: "string", // Mantido como string
    type: "string",
    amount_of_milk_produced: "int",
    number_of_cows_head: "int",
    had_supervision: "bool",
    farmer: "Farmer",
    from: "FromTo",
    to: "FromTo",
    location: "Location",
    created_at: "date",
    updated_at: "date",
    unsynced: "bool",
  },
  primaryKey: "_id",
};

export default ChecklistSchema;
export { FarmerSchema, FromToSchema, LocationSchema };


