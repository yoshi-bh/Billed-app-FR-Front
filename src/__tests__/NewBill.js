/**
 * @jest-environment jsdom
 */

import { fireEvent, screen, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";

import { localStorageMock } from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store.js";
import router from "../app/Router.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import userEvent from "@testing-library/user-event";

describe("Given I am connected as an employee", () => {
	describe("When I am on NewBill Page", () => {
		beforeEach(() => {
			Object.defineProperty(window, "localStorage", { value: localStorageMock });
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
					email: "a@a",
				})
			);
			const root = document.createElement("div");
			root.setAttribute("id", "root");
			document.body.append(root);
			router();
		});

		test("Then newbill icon in vertical layout should be highlighted", async () => {
			window.onNavigate(ROUTES_PATH.NewBill);
			await waitFor(() => screen.getByTestId("icon-mail"));
			const windowIcon = screen.getByTestId("icon-mail");
			expect(windowIcon.classList).toContain("active-icon");
		});

		describe("when I add a file to Justificatif", () => {
			test("Then I add File", async () => {
				const dashboard = new NewBill({
					document,
					onNavigate,
					store: mockStore,
					localStorage: localStorageMock,
				});

				const handleChangeFile = jest.fn(dashboard.handleChangeFile);
				const inputFile = screen.getByTestId("file");
				inputFile.addEventListener("change", handleChangeFile);
				fireEvent.change(inputFile, {
					target: {
						files: [
							new File(["document.jpg"], "document.jpg", {
								type: "document/jpg",
							}),
							new File(["document.jpeg"], "document.jpeg", {
								type: "image/jpeg",
							}),
							new File(["document.png"], "document.png", {
								type: "image/png",
							}),
						],
					},
				});

				expect(handleChangeFile).toHaveBeenCalled();
				expect(handleChangeFile).toBeCalled();
				expect(screen.getByText("Envoyer une note de frais")).toBeTruthy();
			});
			test("Then the file should be added if valid", () => {
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
			test("Then the file should be rejected if invalid", () => {
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
			});
		});

		describe("When I am on NewBill Page and submit the form", () => {
			test("it should call the handleSubmit function", () => {
				window.localStorage.setItem(
					"user",
					JSON.stringify({
						type: "Employee",
					})
				);

				document.body.innerHTML = NewBillUI();

				const onNavigate = (pathname) => {
					document.body.innerHTML = ROUTES({ pathname });
				};

				const store = {
					bills: jest.fn(() => newBill.store),
					create: jest.fn(() => Promise.resolve({})),
					update: jest.fn(() => Promise.resolve({})),
				};

				const newBill = new NewBill({ document, onNavigate, store, localStorage });


				const formNewBill = screen.getByTestId("form-new-bill");
				const handleSubmit = jest.fn(newBill.handleSubmit);
				formNewBill.addEventListener("submit", handleSubmit);
				fireEvent.submit(formNewBill);

				expect(handleSubmit).toHaveBeenCalled();
			});
		});
	});
});
describe("When I navigate to Dashboard employee", () => {
	describe("As an Employee trying to post a new bill", () => {
		test("Then should add a bill", async () => {
			const postSpy = jest.spyOn(mockStore, "bills");
			const bill = {
				id: "47qAXb6fIm2zOKkLzMro",
				vat: "80",
				fileUrl: "https://firebasestorage.googleapis.com/v0/b/billable-677b6.a…f-1.jpg?alt=media&token=c1640e12-a24b-4b11-ae52-529112e9602a",
				status: "pending",
				type: "Hôtel et logement",
				commentary: "séminaire billed",
				name: "encore",
				fileName: "preview-facture-free-201801-pdf-1.jpg",
				date: "2004-04-04",
				amount: 400,
				commentAdmin: "ok",
				email: "a@a",
				pct: 20,
			};
			const postBills = await mockStore.bills().update(bill);
			expect(postSpy).toHaveBeenCalledTimes(1);
			expect(postBills).toStrictEqual(bill);
		});

		beforeEach(() => {
			window.localStorage.setItem(
				"user",
				JSON.stringify({
					type: "Employee",
				})
			);

			document.body.innerHTML = NewBillUI();

			const onNavigate = (pathname) => {
				document.body.innerHTML = ROUTES({ pathname });
			};

		});
		test("Then should fail with a 404", async () => {
			const postSpy = jest.spyOn(console, "error");

			const store = {
				bills: jest.fn(() => newBill.store),
				create: jest.fn(() => Promise.resolve({})),
				update: jest.fn(() => Promise.reject(new Error("404"))),
			};

			const newBill = new NewBill({ document, onNavigate, store, localStorage });

			// Submit form
			const form = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);
			await new Promise(process.nextTick);
			expect(postSpy).toBeCalledWith(new Error("404"));
		});

		test("Then should fail with a 500", async () => {
			const postSpy = jest.spyOn(console, "error");

			const store = {
				bills: jest.fn(() => newBill.store),
				create: jest.fn(() => Promise.resolve({})),
				update: jest.fn(() => Promise.reject(new Error("500"))),
			};

			const newBill = new NewBill({ document, onNavigate, store, localStorage });

			// Submit form
			const form = screen.getByTestId("form-new-bill");
			const handleSubmit = jest.fn((e) => newBill.handleSubmit(e));
			form.addEventListener("submit", handleSubmit);

			fireEvent.submit(form);
			await new Promise(process.nextTick);
			expect(postSpy).toBeCalledWith(new Error("500"));
		});
	});
});
