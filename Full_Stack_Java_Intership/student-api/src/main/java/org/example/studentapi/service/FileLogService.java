package org.example.studentapi.service;

import org.springframework.stereotype.Service;

import java.io.BufferedWriter;
import java.io.FileWriter;
import java.io.IOException;

@Service

public class FileLogService {
    public void logActionToFile(String action){

        try(
                FileWriter fw= new FileWriter("Student_log.txt",true);
                BufferedWriter bw= new BufferedWriter(fw);
        ){
            bw.write(action);
            bw.newLine();
        } catch (IOException e) {
            System.out.println("File Write Error"+e.getMessage());
        }
    }
}
