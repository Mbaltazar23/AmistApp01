<?php

namespace App\Http\Controllers\Api;

use App\Models\User;
use App\Models\Action;
use App\Models\Course;
use Illuminate\Support\Str;
use Illuminate\Http\Request;
use App\Models\PointAlumnAction;
use App\Http\Controllers\Controller;
use Illuminate\Support\Facades\Auth;

class StudentController extends Controller
{

    public function index()
    {
        $userId = Auth::id();
        $user = User::with('colleges')->find($userId);
        $collegeId = $user->colleges->first()->college_id;

        $course = Course::where('college_id', $collegeId)
            ->whereHas('students', function ($query) use ($userId) {
                $query->where('user_id', $userId);
            })
            ->first();

        $students = $course->students()
            ->where('user_id', '<>', $userId)
            ->whereHas('user', function ($query) {
                $query->where('status', '<>', 0);
            })
            ->with('user')
            ->get();

        $data = [];

        foreach ($students as $key => $student) {
            $data[] = [
                'id' => $student->id,
                'dni' => $student->user->dni,
                'nombre' => $student->user->name,
                'email' => $student->user->email,
                'telefono' => $student->user->phone,
                'puntos' => $student->user->points,
            ];

            
        }
        return response()->json($data);
    }

    /**
     * Store a newly created resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @return \Illuminate\Http\Response
     */
    public function store(Request $request)
    {
        $idSend =  Auth::id();
        $idRecep = $request->input("idUserRec");
        $idAction = $request->input("listActions");

        $action = Action::findOrFail($idAction);
        $points = $action->points;

        $pointAlumnAction = PointAlumnAction::where('user_send_id', $idSend)
            ->where('user_recept_id', $idRecep)
            ->first();

        if ($pointAlumnAction) {
            $pointAlumnAction->points += $points;
            $pointAlumnAction->save();
        } else {
            $pointAlumnAction = PointAlumnAction::create([
                'points' => $points,
                'user_send_id' => $idSend,
                'user_recept_id' => $idRecep,
                'action_id' => $idAction,
                'remember_token' => Str::random(10),
            ]);
        }

        $userRecep = User::findOrFail($idRecep);
        $userRecep->points += $points;
        $userRecep->save();

        $user = User::findOrFail($idSend);
        $user->points -= $action->points;
        $user->save();

        return response()->json(['status' => true, 'msg' => 'Puntos enviados Exitosamente !!']);    }

    /**
     * Display the specified resource.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function show($id)
    {
        
        $student = User::find($id);
        if ($student) {
            return response()->json([
                'status' => true,
                'data' => [
                    'id' => $student->id,
                    'idUserS' => Auth::user()->id,
                    'dni' => $student->dni,
                    'nombre' => $student->name,
                    'correo' => $student->email,
                    'direccion' => $student->address,
                    'status' => $student->status,
                ],
                'msg' => 'Estudiante obtenido correctamente',
            ]);
        } else {
            return response()->json([
                'status' => false,
                'msg' => 'No se pudo obtener la categor??a',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     *
     * @param  \Illuminate\Http\Request  $request
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function update(Request $request, $id)
    {
        //
    }

    /**
     * Remove the specified resource from storage.
     *
     * @param  int  $id
     * @return \Illuminate\Http\Response
     */
    public function destroy($id)
    {
        //
    }

    public function selectActions()
    {
        $role = Auth::user()->roles->first()->role;

        $actions = Action::where('status', '!=', 0)->where('type', $role)
            ->get();

    
        return response()->json($actions);
    }
}
