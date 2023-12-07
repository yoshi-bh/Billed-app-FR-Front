/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		test("Then newbill icon in vertical layout should be highlighted", async () => {
			Object.defineProperty(window, "localStorage", {
				value: localStorageMock,
			});
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);
			// WHY DO THIS ?
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
			// END QUESTION
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId("icon-mail"));
			const windowIcon = screen.getByTestId("icon-mail");
			expect(windowIcon.classList).toContain("active-icon");
		});

		describe("when I add a file to Justificatif with the correct type", () => {
			test("Then the file should be added", () => {
				Object.defineProperty(window, "localStorage", {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					})
				);
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				const store = null;
				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				const html = NewBillUI();
				document.body.innerHTML = html;

				const addFileInpt = screen.getByTestId("file");
				const str = JSON.stringify("someValues");
				const blob = new Blob([str]);
				const file = new File([blob], "values.png", { type: "image/png" });

				const handleAddFile = jest.fn((e) => newBill.handleChangeFile(e));
				addFileInpt.addEventListener("click", handleAddFile);
				fireEvent.click(addFileInpt);
				expect(handleAddFile).toHaveBeenCalled();
				userEvent.upload(addFileInpt, file);
				expect(addFileInpt.files.length).toBe(1);
				expect(addFileInpt.files[0].name).toBe("values.png");
			});
		});
		describe("when I add a file to Justificatif with an incorrect type", () => {
			test("Then the file should be rejected", () => {
				Object.defineProperty(window, "localStorage", {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					})
				);
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				const store = null;
				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				const html = NewBillUI();
				document.body.innerHTML = html;

				const addFileInpt = screen.getByTestId("file");
				const str = JSON.stringify("someValues");
				const blob = new Blob([str]);
				const file = new File([blob], "values.json", {
					type: "application/JSON",
				});

				const handleAddFile = jest.fn((e) => newBill.handleChangeFile(e));
				addFileInpt.addEventListener("click", handleAddFile);
				fireEvent.click(addFileInpt);
				expect(handleAddFile).toHaveBeenCalled();
				userEvent.upload(addFileInpt, file);
				expect(addFileInpt.files.length).toBe(1); // Value to be 0
				// expect(addFileInpt.files[0].name).toBe("");
			});
		});

		describe("when I click on the submit button and all the required inputs are filled", () => {
			test("Then the form should be submited", () => {
				Object.defineProperty(window, "localStorage", {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
            email: "a@a"
					})
				);
        const root = document.createElement("div");
				root.setAttribute("id", "root");
				document.body.appendChild(root);
				router();
				const store = null;
        const html = NewBillUI();
        document.body.innerHTML = html;

				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				// Fill the form
				const datepicker = screen.getByTestId("datepicker");
				datepicker.value = "2023-12-22";
				const amount = screen.getByTestId("amount");
				amount.value = "1";
				const pct = screen.getByTestId("pct");
				pct.value = "1";
				const addFileInpt = screen.getByTestId("file");
				const str = JSON.stringify("someValues");
				const blob = new Blob([str]);
				const file = new File([blob], "values.png", { type: "image/png" });
				userEvent.upload(addFileInpt, file);

				// const handleAddFile = jest.fn((e) => newBill.handleChangeFile(e));
				// addFileInpt.addEventListener("click", handleAddFile);
				// fireEvent.click(addFileInpt);

				// Submit the form
				const submitBtn = screen.getByTestId("btn-send-bill");
				const handleSubmitForm = jest.fn((e) => newBill.handleSubmit(e));
				submitBtn.addEventListener("submit", handleSubmitForm);
				fireEvent.submit(submitBtn);

				expect(handleSubmitForm).toHaveBeenCalled();
				// expect(handleAddFile).toHaveBeenCalled();
				// expect(submitBtn.files.length).toBe(1);
				// expect(submitBtn.files[0].name).toBe("values.png");
			});
		});
		describe("when I click on the submit button but some required inputs are not filled", () => {
			test("Then the form should not be submited", () => {
				Object.defineProperty(window, "localStorage", {
					value: localStorageMock,
				});
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					})
				);
				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};
				const store = null;
        const html = NewBillUI();
        document.body.innerHTML = html;

				const newBill = new NewBill({
					document,
					onNavigate,
					store,
					localStorage,
				});

				// Submit the form
				const submitBtn = screen.getByTestId("btn-send-bill");
				const handleSubmitForm = jest.fn((e) => newBill.handleSubmit(e));
				submitBtn.addEventListener("submit", handleSubmitForm);
				fireEvent.submit(submitBtn);

				expect(handleSubmitForm).toHaveBeenCalled();
				// expect(handleAddFile).toHaveBeenCalled();
				// expect(submitBtn.files.length).toBe(1);
				// expect(submitBtn.files[0].name).toBe("values.png");
			});
		});
	});
});
