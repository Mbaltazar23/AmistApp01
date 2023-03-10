let tableAlumns;
let rowTable = "";
document.addEventListener(
    "DOMContentLoaded",
    function () {
        tableAlumns = $("#tableAlumns").dataTable({
            aProcessing: true,
            aServerSide: true,
            language: {
                url: "//cdn.datatables.net/plug-ins/1.10.20/i18n/Spanish.json",
            },
            columns: [
                { data: "dni" },
                { data: "nombre" },
                { data: "email" },
                { data: "telefono" },
                { data: "curso" },
                { data: "status" },
                {
                    data: "options",
                    render: function (data) {
                        return data;
                    },
                },
            ],
            ajax: {
                url: "/students",
                method: "GET",
                dataSrc: function (json) {
                    if (!json.status) {
                        console.error(json.message);
                        return [];
                    }
                    return json.data;
                },
            },
            paging: true,
            ordering: true,
            info: true,
            autoWidth: false,
            responsive: true,
            bDestroy: true,
            iDisplayLength: 10,
            order: [[0, "asc"]],
        });

        //NUEVO ALUMNO
        let formAlumns = document.querySelector("#formAlumns");
        formAlumns.onsubmit = function (e) {
            e.preventDefault();
            let txtRutAlu = document.querySelector("#txtRutAlu").value;
            let listCurso = document.querySelector("#listCurso").value;
            let txtCorreoAlu = $("#txtCorreoAlu").val();
            let txtNombres = $("#txtNombres").val();
            let txtTelefono01 = $("#txtTelefono").val();

            let regexCorreo =
                /[\w-\.]{2,}@([\w-]{2,}\.)*([\w-]{2,}\.)[\w-]{2,4}/;
            var regulTele = /^(\+?56)?(\s?)(0?9)(\s?)[9876543]\d{7}$/;

            if (
                txtNombres == "" ||
                txtRutAlu == "" ||
                listCurso == "" ||
                txtCorreoAlu == "" ||
                txtTelefono01 == ""
            ) {
                swal("Atenci??n", "Todos los campos son obligatorios.", "error");
                return false;
            } else if (
                !regulTele.test(txtTelefono01) ||
                !regexCorreo.test(txtCorreoAlu)
            ) {
                swal(
                    "Error !!",
                    "El correo u telefono ingresados no son validos",
                    "error"
                );
                return false;
            } else {
                let formData = new FormData(formAlumns);
                axios
                    .post("/students/setStudent", formData)
                    .then(function (response) {
                        if (response.data.status) {
                            tableAlumns.api().ajax.reload();
                            $("#modalFormAlumno").modal("hide");
                            formAlumns.reset();
                            swal("Exito !!", response.data.msg, "success");
                        } else {
                            swal("Error !!", response.data.msg, "error");
                        }
                    })
                    .catch(function (error) {
                        console.log(error);
                        swal(
                            "Error",
                            "Ocurri?? un error al procesar la petici??n",
                            "error"
                        );
                    });
            }
        };
        fntSelectsAlumns();
    },
    false
);

function fntSelectsAlumns() {
    if (document.querySelector("#listCurso")) {
        let select ="alumno";
        axios
            .post(`/courses/select/${select}`)
            .then((response) => {
                $(".selectCursos select").html(response.data).fadeIn();
            })
            .catch((error) => {
                console.log(error);
            });
    }
}

function fntViewInfo(idalu) {
    axios
        .get(`/students/getStudent/${idalu}`)
        .then(function (response) {
            if (response.data.status) {
                let estado =
                    response.data.data.status == 1
                        ? '<span class="badge badge-success">Activo</span>'
                        : '<span class="badge badge-dark">Con Plan</span>';
                document.querySelector("#celRut").innerHTML =
                    response.data.data.dni;
                document.querySelector("#celNombre").innerHTML =
                    response.data.data.nombre;

                document.querySelector("#celCurso").innerHTML =
                    response.data.data.curso;
                document.querySelector("#celTelefono").innerHTML =
                    response.data.data.telefono;
                document.querySelector("#celDireccion").innerHTML =
                    response.data.data.direccion != ""
                        ? response.data.data.direccion
                        : "No se tiene una direccion registrada.";
                document.querySelector("#celEstado").innerHTML = estado;
                $("#modalViewAlumno").modal("show");
            } else {
                swal("Error", response.data.msg, "error");
            }
        })
        .catch(function (error) {
            console.log(error);
            swal("Error", "Ocurri?? un error al procesar la petici??n", "error");
        });
}

function fntEditInfo(element, idalu) {
    rowTable = element.parentNode.parentNode.parentNode;
    document.querySelector("#titleModal").textContent = "Actualizar Alumno";
    document
        .querySelector("#btnActionForm")
        .classList.replace("btn-info", "btn-primary");
    document.querySelector("#btnText").textContent = "  Actualizar";
    axios
        .get(`/students/getStudent/${idalu}`)
        .then(function (response) {
            if (response.data.status) {
                document.querySelector("#idAlumn").value =
                    response.data.data.id;
                document.querySelector("#txtRutAlu").value =
                    response.data.data.dni;
                document.querySelector("#txtCorreoAlu").value =
                    response.data.data.correo.toString().toLowerCase();
                document.querySelector("#txtNombres").value =
                    response.data.data.nombre.toString().toLowerCase();
                document.querySelector("#listCurso").value =
                    response.data.data.idCurso;
                document.querySelector("#txtTelefono").value =
                    response.data.data.telefono;
                document.querySelector("#txtDireccion").value =
                    response.data.data.direccion;
                validadorRut("txtRutAlu");
                $("#modalFormAlumno").modal("show");
            } else {
                swal("Error", response.data.msg, "error");
            }
        })
        .catch(function (error) {
            console.log(error);
            swal("Error", "Ocurri?? un error al procesar la petici??n", "error");
        });
}

function fntDelInfo(idalumn) {
    swal({
        title: "Inhabilitar Alumno",
        text: "??Realmente quiere inhabilitar este rol?",
        icon: "warning",
        dangerMode: true,
        buttons: true,
    }).then((isClosed) => {
        if (isClosed) {
            let status = 0;
            axios
                .post(`/students/status/${idalumn}`, { status: status })
                .then((response) => {
                    if (response.data.status) {
                        swal("Inhabilitada!", response.data.msg, "success");
                        tableAlumns.api().ajax.reload();
                    } else {
                        swal("Atenci??n!", response.data.msg, "error");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    });
}

function fntActivateInfo(idalumn) {
    swal({
        title: "Habilitar Alumno",
        text: "??Realmente quiere habilitar a este alumno?",
        icon: "info",
        dangerMode: true,
        buttons: true,
    }).then((isClosed) => {
        if (isClosed) {
            let status = 1;
            axios
                .post(`/students/status/${idalumn}`, { status: status })
                .then((response) => {
                    if (response.data.status) {
                        swal("Habilitado !!", response.data.msg, "success");
                        tableAlumns.api().ajax.reload();
                    } else {
                        swal("Atenci??n!", response.data.msg, "error");
                    }
                })
                .catch((error) => {
                    console.error(error);
                });
        }
    });
}

function openModal() {
    document.querySelector("#idAlumn").value = "";
    document
        .querySelector("#btnActionForm")
        .classList.replace("btn-primary", "btn-info");
    document.querySelector("#btnText").textContent = "  Guardar";
    document.querySelector("#titleModal").textContent = "Nuevo Alumno";
    document.querySelector("#formAlumns").reset();
    validadorRut("txtRutAlu");
    $("#modalFormAlumno").modal("show");
}

function generarReporte() {
    axios
        .post("/students/report")
        .then(function (response) {
            var fecha = new Date();
            var Alumnos = response.data.data;
            //console.log(tecnicos);
            let estado = "";
            var pdf = new jsPDF();
            pdf.text(20, 20, "Reportes de los Alumnos Registrados");
            var data = [];
            let telefons = "";
            var columns = [
                "RUT",
                "NOMBRES",
                "TELEFONO",
                "DIRECCION",
                "CURSO",
                "ESTADO",
            ];
            for (let i = 0; i < Alumnos.length; i++) {
                if (Alumnos[i].status == 1) {
                    estado = "ACTIVO";
                } else {
                    estado = "INACTIVO";
                }

                data[i] = [
                    Alumnos[i].dni,
                    Alumnos[i].nombre,
                    Alumnos[i].telefono,
                    Alumnos[i].direccion != ""
                        ? Alumnos[i].direccion
                        : "No se tiene una direccion registrada",
                    Alumnos[i].curso,
                    estado,
                ];
            }
            pdf.autoTable(columns, data, {
                startY: 40,
                styles: {
                    cellPadding: 8,
                    fontSize: 8,
                    font: "helvetica",
                    textColor: [0, 0, 0],
                    fillColor: [255, 255, 255],
                    lineWidth: 0.1,
                    halign: "center",
                    valign: "middle",
                },
            });

            pdf.text(
                20,
                pdf.autoTable.previous.finalY + 20,
                "Fecha de Creacion : " +
                    fecha.getDate() +
                    "/" +
                    (fecha.getMonth() + 1) +
                    "/" +
                    fecha.getFullYear()
            );
            pdf.save("ReporteAlumnos.pdf");
            swal("Exito", "Reporte Imprimido Exitosamente..", "success");
        })
        .catch(function (error) {
            console.log(error);
        });
}
