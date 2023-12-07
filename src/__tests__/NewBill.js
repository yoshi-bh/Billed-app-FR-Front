/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import user from "@testing-library/user-event";

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
				user.upload(addFileInpt, file);
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
				const file = new File([blob], "values.json", { type: 'application/JSON' });

				const handleAddFile = jest.fn((e) => newBill.handleChangeFile(e));
				addFileInpt.addEventListener("click", handleAddFile);
				fireEvent.click(addFileInpt);
				expect(handleAddFile).toHaveBeenCalled();
				user.upload(addFileInpt, file);
				expect(addFileInpt.files.length).toBe(1); // Value to be 0
				// expect(addFileInpt.files[0].name).toBe("");
			});
		});

		describe("when I click on the submit button and all the required inputs are filled", () => {
			test("Then the form should be submited", () => {
				const html = NewBillUI();
				document.body.innerHTML = html;
				//to-do write assertion
			});
		});
		describe("when I click on the submit button but some required inputs are not filled", () => {
			test("Then the form should not be submited", () => {
				const html = NewBillUI();
				document.body.innerHTML = html;
				//to-do write assertion
			});
		});
	});
});
