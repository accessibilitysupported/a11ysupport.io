export default {
  "data/tech/**/*.json": (filenames) => {
    return filenames.map(file => `ajv validate -s data/schema/feature.json  -r data/schema/test.json --strict=false -d ${file}`);
  },
  "data/tests/**/*.json": (filenames) => {
    return filenames.map(file => `ajv validate -s data/schema/test.json --strict=false -d ${file}`);
  },
};
