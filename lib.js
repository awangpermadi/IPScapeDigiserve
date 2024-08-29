/**
 * @function namespaceExists
 * @description Checks for the namespace in the global scope
 * @param prop (string)
 **/
export function namespaceExists(prop) {
    const parts = prop.split(".");
    return parts.reduce((prev, curr) => {
      return typeof prev === "undefined" ? prev : prev[curr];
    }, window);
  }
  