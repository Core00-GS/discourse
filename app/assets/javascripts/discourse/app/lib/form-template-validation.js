import I18n from "discourse-i18n";

export function getFormTemplateObject(form) {
  const formData = new FormData(form);

  const formObject = {};
  formData.forEach((value, key) => {
    formObject[key] = value;
  });

  return formObject;
}

export default function prepareFormTemplateData(form, formTemplate) {
  const labelMap = formTemplate.reduce((acc, field) => {
    acc[field.id] = field.attributes.label;
    return acc;
  }, {});

  const formData = new FormData(form);

  // Validate the form template
  _validateFormTemplateData(form);
  if (!form.checkValidity()) {
    return false;
  }

  // Gather form template data
  const formDetails = [];
  for (let [key, value] of formData.entries()) {
    formDetails.push({
      [key]: value,
    });
  }

  const mergedData = [];
  const mergedKeys = new Set();

  for (const item of formDetails) {
    const key = Object.keys(item)[0]; // Get the key of the current item
    if (mergedKeys.has(key)) {
      // If the key has already been merged, append the value to the existing key
      mergedData[mergedData.length - 1][key] += "\n" + item[key];
    } else {
      mergedData.push(item);
      mergedKeys.add(key);
    }
  }

  // Construct formatted post output
  const formattedOutput = mergedData.map((item) => {
    const key = Object.keys(item)[0];
    const value = item[key];
    if (value) {
      return `### ${labelMap[key]}\n${value}`;
    }
  });

  return formattedOutput.join("\n\n");
}

function _validateFormTemplateData(form) {
  const fields = Array.from(form.elements);

  fields.forEach((field) => {
    field.setAttribute("aria-invalid", false);

    const errorBox = document.createElement("div");
    errorBox.classList.add("form-template-field__error", "popup-tip");
    const errorId = field.id + "-error";

    field.addEventListener("invalid", () => {
      field.setAttribute("aria-invalid", true);
      errorBox.classList.add("bad");
      errorBox.setAttribute("id", errorId);
      field.setAttribute("aria-describedby", errorId);

      if (!field.nextElementSibling) {
        field.insertAdjacentElement("afterend", errorBox);
      }

      _showErrorMessage(field, errorBox);
    });

    // Mark the field as valid as changed:
    field.addEventListener("input", () => {
      const valid = field.checkValidity();
      if (valid) {
        field.setAttribute("aria-invalid", false);
        errorBox.classList.remove("bad");

        errorBox.textContent = "";
      }
    });

    field.addEventListener("blur", () => {
      field.checkValidity();
    });
  });
}

function _showErrorMessage(field, element) {
  if (field.validity.valueMissing) {
    const prefix = "form_templates.errors.valueMissing";
    const types = [
      "select-one",
      "select-multiple",
      "checkbox",
      "text",
      "number",
    ];
    _showErrorByType(element, field, prefix, types);
  } else if (field.validity.typeMismatch) {
    const prefix = "form_templates.errors.typeMismatch";
    const types = [
      "color",
      "date",
      "email",
      "number",
      "password",
      "tel",
      "text",
      "url",
    ];
    _showErrorByType(element, field, prefix, types);
  } else if (field.validity.tooShort) {
    element.textContent = I18n.t("form_templates.errors.tooShort", {
      count: field.minLength,
    });
  } else if (field.validity.tooLong) {
    element.textContent = I18n.t("form_templates.errors.tooLong", {
      count: field.maxLength,
    });
  } else if (field.validity.rangeOverflow) {
    element.textContent = I18n.t("form_templates.errors.rangeOverflow", {
      count: field.max,
    });
  } else if (field.validity.rangeUnderflow) {
    element.textContent = I18n.t("form_templates.errors.rangeUnderflow", {
      count: field.min,
    });
  } else if (field.validity.patternMismatch) {
    element.textContent = I18n.t("form_templates.errors.patternMismatch");
  } else if (field.validity.badInput) {
    element.textContent = I18n.t("form_templates.errors.badInput");
  }
}

function _showErrorByType(element, field, prefix, types) {
  if (!types.includes(field.type)) {
    element.textContent = I18n.t(`${prefix}.default`);
  } else {
    types.forEach((type) => {
      if (field.type === type) {
        element.textContent = I18n.t(`${prefix}.${type}`);
      }
    });
  }
}
